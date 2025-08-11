import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import authService from '../../services/authService';
import { deleteReaction, getReactions, ReactionEntry, ReactionsByType, ReactionType, setReaction, TargetType } from '../../services/reactionService';

export interface ReactionBarProps {
  targetType: TargetType;
  targetId: string;
  // optional: optimistic update callback
  onReactionChange?: (type: ReactionType | null) => void;
}

const REACTION_META: { type: ReactionType; icon: string; label: string }[] = [
  { type: 'like', icon: 'thumb-up', label: 'Thích' },
  { type: 'love', icon: 'favorite', label: 'Yêu thích' },
  { type: 'haha', icon: 'emoji-emotions', label: 'Haha' },
  { type: 'wow', icon: 'emoji-objects', label: 'Wow' },
  { type: 'sad', icon: 'sentiment-dissatisfied', label: 'Buồn' },
  { type: 'angry', icon: 'sentiment-very-dissatisfied', label: 'Giận' },
];

const REACTION_COLOR: Record<ReactionType, string> = {
  like: '#1877F2',
  love: '#E0245E',
  haha: '#F7B125',
  wow: '#F0A35E',
  sad: '#1C6DD0',
  angry: '#E05D4A',
};

function getUserDisplayName(u: any): string {
  if (!u) return 'Người dùng';
  if (u.firstName || u.lastName) {
    return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || 'Người dùng';
  }
  return u.name || 'Người dùng';
}

function isSameUser(a: any, b: any): boolean {
  if (!a || !b) return false;
  const aId = a.id || a._id;
  const bId = b.id || (b as any)._id;
  if (aId && bId) return String(aId) === String(bId);
  const aName = getUserDisplayName(a).toLowerCase();
  const bName = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase() || (b as any).name?.toLowerCase();
  return !!aName && !!bName && aName === bName;
}

export default function ReactionBar({ targetType, targetId, onReactionChange }: ReactionBarProps) {
  const authUser = useAppSelector((state) => state.auth.user);
  const userState = useAppSelector((state) => state.user);
  const [counts, setCounts] = useState<Record<ReactionType, number>>({ like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showList, setShowList] = useState(false);
  const [reactionsByType, setReactionsByType] = useState<ReactionsByType>({});
  const [reactions, setReactions] = useState<ReactionEntry[]>([]);

  const findUserInfoById = (id: string | undefined | null) => {
    if (!id) return null;
    // Try user.currentUser first
    const cu: any = userState.currentUser;
    if (cu && (cu.id === id || (cu as any)._id === id)) {
      return {
        id: cu.id || (cu as any)._id,
        _id: cu.id || (cu as any)._id,
        firstName: cu.firstName,
        lastName: cu.lastName,
        name: `${cu.firstName || ''} ${cu.lastName || ''}`.trim() || cu.name,
        avatar: cu.avatar,
      };
    }
    // Then groupUsers (handles both direct user objects and { user: {...} })
    for (const gu of userState.groupUsers as any[]) {
      const candidate = (gu && gu.user) ? gu.user : gu;
      const candId = candidate?.id || candidate?._id;
      if (String(candId || '') === String(id)) {
        return {
          id: candId,
          _id: candId,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          name: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || candidate.name,
          avatar: candidate.avatar,
        };
      }
    }
    return null;
  };

  const getCurrentUserInfo = () => {
    const fromStore = authUser as any;
    if (fromStore && fromStore.id) {
      // Enrich from group/users slice if missing avatar/name
      const enriched = findUserInfoById(fromStore.id);
      return {
        id: fromStore.id,
        _id: fromStore.id,
        firstName: enriched?.firstName ?? fromStore.firstName,
        lastName: enriched?.lastName ?? fromStore.lastName,
        name: (((enriched?.firstName ?? fromStore.firstName) || '') + ' ' + ((enriched?.lastName ?? fromStore.lastName) || '')).trim() || (enriched?.name || fromStore.name),
        avatar: enriched?.avatar ?? fromStore.avatar,
      };
    }
    const fromService = authService.getCurrentUser() as any;
    if (fromService) {
      const enriched = findUserInfoById(fromService.id);
      return {
        id: fromService.id,
        _id: fromService.id,
        firstName: enriched?.firstName ?? fromService.firstName,
        lastName: enriched?.lastName ?? fromService.lastName,
        name: (((enriched?.firstName ?? fromService.firstName) || '') + ' ' + ((enriched?.lastName ?? fromService.lastName) || '')).trim() || (enriched?.name || fromService.name),
        avatar: enriched?.avatar ?? fromService.avatar,
      };
    }
    return null;
  };

  const fetchData = async () => {
    try {
      // Validate parameters before making API call
      if (!targetType || !targetId) {
        console.warn('ReactionBar: Missing required parameters', { targetType, targetId });
        return;
      }

      // Additional validation for targetId format
      if (typeof targetId !== 'string' || targetId.trim() === '') {
        console.warn('ReactionBar: Invalid targetId format', { targetId });
        return;
      }

      const res = await getReactions(targetType, targetId);
      const nextCounts: Record<ReactionType, number> = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
      (Object.keys(nextCounts) as ReactionType[]).forEach((t) => {
        nextCounts[t] = (res.reactions as any)[t]?.length || 0;
      });

      // xác định reaction hiện tại của user từ danh sách
      let current: ReactionType | null = null;
      const currentUser = getCurrentUserInfo();

      if (currentUser) {
        (Object.keys(nextCounts) as ReactionType[]).forEach((t) => {
          const arr = (res.reactions as any)[t] as Array<ReactionEntry> | undefined;
          if (arr && arr.some((r) => isSameUser(r.user, currentUser))) {
            current = t;
          }
        });
      }

      setCounts(nextCounts);
      setUserReaction(current);
      setReactionsByType(res.reactions || {});
    } catch (e) {
      console.warn('ReactionBar: Error fetching reactions:', e);
      // Keep existing state on error
    }
  };

  useEffect(() => {
    fetchData();
  }, [targetType, targetId]);

  const total = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

  const optimisticallyUpdateList = (nextType: ReactionType | null) => {
    const currentUser = getCurrentUserInfo();
    if (!currentUser) return;

    setReactionsByType((prev) => {
      const cloned: ReactionsByType = { ...prev };
      // remove current user from any previous type arrays
      (Object.keys(REACTION_COLOR) as ReactionType[]).forEach((t) => {
        const arr = (cloned as any)[t] as ReactionEntry[] | undefined;
        if (arr) {
          (cloned as any)[t] = arr.filter((entry) => !isSameUser(entry.user, currentUser));
        }
      });

      if (nextType) {
        const firstName = currentUser.firstName || '';
        const lastName = currentUser.lastName || '';
        const displayName = (firstName || lastName)
          ? `${firstName} ${lastName}`.trim()
          : (currentUser.name || 'Người dùng');
        const entry: ReactionEntry = {
          user: {
            id: currentUser.id,
            _id: currentUser._id,
            firstName,
            lastName,
            name: displayName,
            avatar: currentUser.avatar,
          },
          type: nextType,
          createdAt: new Date().toISOString(),
        };
        const arr = (cloned as any)[nextType] as ReactionEntry[] | undefined;
        (cloned as any)[nextType] = [...(arr || []), entry];
      }

      return cloned;
    });
  };

  const applyReaction = async (type: ReactionType | null) => {
    if (loading) return;
    setLoading(true);

    // optimistic UI
    setUserReaction(type);
    setCounts((prev) => {
      const next = { ...prev };
      if (type === null) {
        if (userReaction) next[userReaction] = Math.max(0, next[userReaction] - 1);
      } else {
        if (userReaction) next[userReaction] = Math.max(0, next[userReaction] - 1);
        next[type] = (next[type] || 0) + 1;
      }
      return next;
    });
    optimisticallyUpdateList(type);
    onReactionChange?.(type);

    try {
      // Validate parameters before making API call
      if (!targetType || !targetId) {
        console.warn('ReactionBar: Missing required parameters for reaction', { targetType, targetId });
        return;
      }

      // Additional validation for targetId format
      if (typeof targetId !== 'string' || targetId.trim() === '') {
        console.warn('ReactionBar: Invalid targetId format for reaction', { targetId });
        return;
      }

      if (type === null) {
        await deleteReaction(targetType, targetId);
      } else {
        await setReaction(targetType, targetId, type);
      }
    } catch (e) {
      console.warn('ReactionBar: Error applying reaction:', e);
      // rollback if error
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const onDefaultPress = () => {
    if (userReaction === 'like') {
      applyReaction(null);
    } else {
      applyReaction('like');
    }
  };

  const { currentType, currentIcon, currentColor } = useMemo(() => {
    const type: ReactionType = userReaction || 'like';
    const meta = REACTION_META.find((r) => r.type === type);
    return {
      currentType: type,
      currentIcon: meta?.icon || 'thumb-up',
      currentColor: userReaction ? REACTION_COLOR[type] : '#666',
    };
  }, [userReaction]);

  const flatReactions = useMemo(() => {
    const entries: { type: ReactionType; entry: ReactionEntry }[] = [];
    (Object.keys(REACTION_COLOR) as ReactionType[]).forEach((t) => {
      const arr = (reactionsByType as any)[t] as ReactionEntry[] | undefined;
      if (arr && arr.length) arr.forEach((e) => entries.push({ type: t, entry: e }));
    });
    return entries.sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime());
  }, [reactionsByType]);

  const displayCount = userReaction ? (counts[userReaction] || 0) : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.reactionButton, userReaction && styles.activeReaction]}
        onPress={onDefaultPress}
        onLongPress={() => setShowPicker(true)}
        disabled={loading}
      >
        <MaterialIcons
          name={currentIcon as any}
          size={18}
          color={currentColor}
        />
        <TouchableOpacity onPress={() => total > 0 && setShowList(true)} disabled={total <= 0}>
          <Text style={[styles.countText, total <= 0 && styles.countDisabled]}>{displayCount}</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <TouchableOpacity style={styles.totalBox} onPress={() => total > 0 && setShowList(true)} disabled={total <= 0}>
        <Text style={[styles.totalText, total <= 0 && styles.countDisabled]}>{total}</Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.reactionMenu}>
              {REACTION_META.map((r) => (
                <TouchableOpacity
                  key={r.type}
                  style={[styles.reactionPickerButton, userReaction === r.type && styles.reactionPickerActive]}
                  onPress={() => {
                    setShowPicker(false);
                    if (userReaction === r.type) {
                      applyReaction(null);
                    } else {
                      applyReaction(r.type);
                    }
                  }}
                  disabled={loading}
                >
                  <MaterialIcons
                    name={r.icon as any}
                    size={24}
                    color={REACTION_COLOR[r.type]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showList}
        transparent
        animationType="fade"
        onRequestClose={() => setShowList(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowList(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.listContainer}>
              <Text style={styles.listTitle}>All ({total})</Text>
              <ScrollView style={{ maxHeight: 360 }}>
                {flatReactions.map(({ type, entry }, idx) => (
                  <View key={`${type}-${idx}-${entry.createdAt}`} style={styles.listItem}>
                    {entry.user?.avatar ? (
                      <Image source={{ uri: entry.user.avatar }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <MaterialIcons name="person" size={16} color="#fff" />
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.userName}>{getUserDisplayName(entry.user)}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <MaterialIcons name={REACTION_META.find((m) => m.type === type)!.icon as any} size={14} color={REACTION_COLOR[type]} />
                      </View>
                    </View>
                  </View>
                ))}
                {total === 0 && (
                  <Text style={styles.emptyText}>No reactions yet</Text>
                )}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginRight: 6,
  },
  activeReaction: {
    backgroundColor: '#e3f2fd',
  },
  countText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  countDisabled: {
    color: '#bbb',
  },
  totalBox: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
  },
  totalText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  reactionMenu: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactionPickerButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 16,
  },
  reactionPickerActive: {
    backgroundColor: '#e3f2fd',
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: 320,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  userName: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  reactionTypeText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eee',
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4f8cff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 12,
  }
}); 