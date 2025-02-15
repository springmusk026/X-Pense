import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Linking,
} from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BackupRestoreModal from '../../components/BackupRestoreModal';

const socialLinks = [
  {
    title: 'GitHub',
    icon: 'github',
    color: '#333',
    url: 'https://github.com/springmusk026',
    description: 'Check out my open source projects',
  },
  {
    title: 'LinkedIn',
    icon: 'linkedin',
    color: '#0077B5',
    url: 'https://www.linkedin.com/in/basanta-sapkota-57529923b/',
    description: 'Connect with me professionally',
  },
  {
    title: 'Portfolio',
    icon: 'web',
    color: '#2196F3',
    url: 'https://basantasapkota026.com.np',
    description: 'View my complete portfolio',
  },
];

const menuItems = [
  {
    title: 'Settings',
    icon: 'cog',
    color: '#2196F3',
    route: '/settings',
    description: 'Configure app preferences',
    items: [
      {
        title: 'Appearance',
        icon: 'palette',
        color: '#9C27B0',
        route: '/settings/appearance',
        description: 'Customize app theme and layout',
      },
      {
        title: 'Notifications',
        icon: 'bell',
        color: '#FF9800',
        route: '/settings/notifications',
        description: 'Manage notification preferences',
      },
      {
        title: 'Privacy',
        icon: 'shield',
        color: '#4CAF50',
        route: '/settings/privacy',
        description: 'Control your privacy settings',
      },
    ],
  },
  {
    title: 'Backup & Restore',
    icon: 'cloud-sync',
    color: '#9C27B0',
    action: 'backup',
    description: 'Secure your data in the cloud',
  },
];

const skills = [
  { name: 'React Native', color: '#61DAFB' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'Node.js', color: '#339933' },
  { name: 'UI/UX Design', color: '#FF7262' },
  { name: 'Mobile Dev', color: '#4CAF50' },
];

export default function MoreScreen() {
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {
      // Handle error
    });
  };

  const handleMenuItemPress = (item: any) => {
    if (item.action === 'backup') {
      setShowBackupModal(true);
    } else if (item.items) {
      setExpandedSection(expandedSection === item.title ? null : item.title);
    }
  };

  const renderMenuItem = (item: any, isSubItem = false) => {
    const MenuItem = (
      <TouchableOpacity
        style={[
          styles.menuItem,
          isSubItem && styles.subMenuItem,
          item.items && expandedSection === item.title && styles.expandedMenuItem,
        ]}
        onPress={() => handleMenuItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
          <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.menuItemText}>{item.title}</Text>
          {item.description && (
            <Text style={styles.menuItemDescription}>{item.description}</Text>
          )}
        </View>
        {item.items ? (
          <MaterialCommunityIcons
            name={expandedSection === item.title ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#757575"
          />
        ) : (
          <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
        )}
      </TouchableOpacity>
    );

    return item.route && !item.items ? (
      <Link key={item.title} href={item.route as any} asChild>
        {MenuItem}
      </Link>
    ) : (
      <View key={item.title}>
        {MenuItem}
        {item.items && expandedSection === item.title && (
          <View style={styles.subMenuContainer}>
            {item.items.map((subItem: any) => renderMenuItem(subItem, true))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.coverImage}>
          <MaterialCommunityIcons name="code-braces" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/200' }}
            style={styles.profileImage}
          />
        </View>
        <Text style={styles.name}>Basanta Sapkota</Text>
        <Text style={styles.role}>Somewhere developer</Text>
        <Text style={styles.bio}>
          Passionate about nothing, just doing something. I just code and i dont know anything about ui/ux design.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expertise</Text>
        <View style={styles.skillsContainer}>
          {skills.map((skill, index) => (
            <View 
              key={index} 
              style={[styles.skillBadge, { backgroundColor: `${skill.color}15` }]}
            >
              <Text style={[styles.skillText, { color: skill.color }]}>{skill.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings & Preferences</Text>
        <View style={styles.menuContainer}>
          {menuItems.map((item) => renderMenuItem(item))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connect</Text>
        <View style={styles.menuContainer}>
          {socialLinks.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleLinkPress(item.url)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.menuItemText}>{item.title}</Text>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.appVersion}>App Version 1.0.0</Text>
        <Text style={styles.copyright}>© 2025 XPense</Text>
      </View>

      <BackupRestoreModal
        visible={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onComplete={() => setShowBackupModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingBottom: 24,
  },
  coverImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: -60,
    backgroundColor: '#FFFFFF',
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2A2D43',
    marginTop: 16,
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  section: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A2D43',
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  skillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expandedMenuItem: {
    backgroundColor: '#FAFAFA',
  },
  subMenuItem: {
    paddingLeft: 32,
    backgroundColor: '#FAFAFA',
  },
  subMenuContainer: {
    borderLeftWidth: 1,
    borderLeftColor: '#F0F0F0',
    marginLeft: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A2D43',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#757575',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: '#9E9E9E',
  },
});