import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppHeader from "./components/layout/AppHeader";
import ScreenWithFooter from "./components/layout/ScreenWithFooter";
import { useThemeColor } from "./hooks/useThemeColor";
import { useAppSelector } from "./redux/hooks";

interface SettingsItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  isDestructive?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  isDestructive = false,
}) => {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "card");

  return (
    <TouchableOpacity
      style={[styles.settingsItem, { borderBottomColor: borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View
          style={[
            styles.iconContainer,
            isDestructive && styles.destructiveIcon,
          ]}
        >
          <MaterialIcons
            name={icon as any}
            size={20}
            color={isDestructive ? "#ff4757" : "#4f8cff"}
          />
        </View>
        <View style={styles.settingsItemContent}>
          <Text
            style={[
              styles.settingsItemTitle,
              { color: textColor },
              isDestructive && styles.destructiveText,
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingsItemSubtitle, { color: textColor }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showArrow && (
        <MaterialIcons name="chevron-right" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );
};

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => {
  const textColor = useThemeColor({}, "text");

  return (
    <View style={styles.settingsSection}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const { currentUser } = useAppSelector((state) => state.user);

  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [defaultPrivacy, setDefaultPrivacy] = useState<"public" | "private">(
    "public"
  );
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [memberNotifications, setMemberNotifications] = useState(true);

  const handleBack = () => {
    router.back();
  };

  const handleSettingsPress = () => {
    // This will be handled by the footer bar
    // Settings pressed handled silently
  };

  const handlePersonalInfo = () => {
    Alert.alert("Thông tin cá nhân", "Tính năng này sẽ được phát triển sau!");
  };

  const handleChangeAvatar = () => {
    Alert.alert("Thay đổi avatar", "Tính năng này sẽ được phát triển sau!");
  };

  const handleChangePassword = () => {
    router.push("/change-password");
  };

  const handleCommentNotifications = () => {
    setCommentNotifications(!commentNotifications);
    Alert.alert(
      "Thông báo bình luận",
      `Đã ${!commentNotifications ? "bật" : "tắt"} thông báo bình luận`
    );
  };

  const handleMemberNotifications = () => {
    setMemberNotifications(!memberNotifications);
    Alert.alert(
      "Thông báo thành viên mới",
      `Đã ${!memberNotifications ? "bật" : "tắt"} thông báo thành viên mới`
    );
  };

  const handleDefaultPrivacy = () => {
    const newPrivacy = defaultPrivacy === "public" ? "private" : "public";
    setDefaultPrivacy(newPrivacy);
    Alert.alert(
      "Quyền riêng tư",
      `Đã đặt mặc định thành ${
        newPrivacy === "public" ? "công khai" : "riêng tư"
      }`
    );
  };

  const handleLanguageChange = () => {
    const newLanguage = language === "vi" ? "en" : "vi";
    setLanguage(newLanguage);
    Alert.alert(
      "Ngôn ngữ",
      `Đã chuyển sang ${newLanguage === "vi" ? "Tiếng Việt" : "English"}`
    );
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          // TODO: Implement logout logic
          router.push("/login");
        },
      },
    ]);
  };

  return (
    <ScreenWithFooter onSettingsPress={handleSettingsPress}>
      <AppHeader
        title="Cài đặt"
        onBack={handleBack}
        showBackButton={true}
        canGoBack={true}
      />

      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          {/* Account Section */}
          <SettingsSection title="👤 Tài khoản">
            <SettingsItem
              icon="person"
              title="Thông tin cá nhân"
              subtitle={
                currentUser
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : "Chưa cập nhật"
              }
              onPress={handlePersonalInfo}
            />
            <SettingsItem
              icon="photo-camera"
              title="Thay đổi avatar"
              subtitle="Cập nhật ảnh đại diện"
              onPress={handleChangeAvatar}
            />
            <SettingsItem
              icon="lock"
              title="Đổi mật khẩu"
              subtitle="Thay đổi mật khẩu tài khoản"
              onPress={handleChangePassword}
            />
          </SettingsSection>

          {/* Notifications Section */}
          <SettingsSection title="🔔 Thông báo">
            <SettingsItem
              icon="chat-bubble"
              title="Bình luận"
              subtitle={commentNotifications ? "Đã bật" : "Đã tắt"}
              onPress={handleCommentNotifications}
              showArrow={false}
            />
            <SettingsItem
              icon="person-add"
              title="Thành viên mới"
              subtitle={memberNotifications ? "Đã bật" : "Đã tắt"}
              onPress={handleMemberNotifications}
              showArrow={false}
            />
          </SettingsSection>

          {/* Privacy Section */}
          <SettingsSection title="🔒 Quyền riêng tư">
            <SettingsItem
              icon="public"
              title="Mặc định public/private"
              subtitle={defaultPrivacy === "public" ? "Công khai" : "Riêng tư"}
              onPress={handleDefaultPrivacy}
              showArrow={false}
            />
          </SettingsSection>

          {/* Language Section */}
          <SettingsSection title="🌐 Ngôn ngữ">
            <SettingsItem
              icon="language"
              title={language === "vi" ? "Tiếng Việt" : "English"}
              subtitle={language === "vi" ? "Đang sử dụng" : "Currently using"}
              onPress={handleLanguageChange}
              showArrow={false}
            />
          </SettingsSection>

          {/* Logout Section */}
          <SettingsSection title="">
            <SettingsItem
              icon="logout"
              title="Đăng xuất"
              subtitle="Thoát khỏi tài khoản"
              onPress={handleLogout}
              showArrow={false}
              isDestructive={true}
            />
          </SettingsSection>
        </ScrollView>
      </View>
    </ScreenWithFooter>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  settingsSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(79, 140, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  destructiveIcon: {
    backgroundColor: "rgba(255, 71, 87, 0.1)",
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  destructiveText: {
    color: "#ff4757",
  },
});
