
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
} from 'react-native';

import LoginScreen from './src/presentation/screens/LoginScreen';
import ClientesScreen from './src/presentation/screens/ClientesScreen';
import { supabase } from './src/infrastructure/supabase/supabaseClient';
import { SupabaseAuthRepository } from './src/infrastructure/repositories/SupabaseAuthRepository';

const authRepository = new SupabaseAuthRepository();

const COLORS = {
  navy: '#172638',
  navyLight: '#24384D',
  blue: '#315C85',
  background: '#F4F6F8',
  white: '#FFFFFF',
  text: '#263445',
  muted: '#788697',
  border: '#E1E6EC',
  selected: '#EAF0F5',
};

const navigationGroups = [
  {
    title: 'GENERAL',
    items: [
      { id: 'inicio', title: 'Panel principal', icon: '▦' },
    ],
  },
  {
    title: 'ADMINISTRACIÓN',
    items: [
      { id: 'clientes', title: 'Clientes', icon: '♙' },
      { id: 'usuarios', title: 'Usuarios', icon: '♧' },
      { id: 'tipos-paquete', title: 'Tipos de paquete', icon: '▣' },
      { id: 'modalidades', title: 'Modalidades de envío', icon: '⇄' },
      { id: 'estados', title: 'Estados de seguimiento', icon: '≡' },
      { id: 'servicios', title: 'Servicios', icon: '◇' },
    ],
  },
  {
    title: 'OPERACIONES',
    items: [
      { id: 'exportaciones', title: 'Exportaciones', icon: '⇧' },
      { id: 'paquetes', title: 'Paquetes', icon: '▣' },
      { id: 'seguimiento', title: 'Seguimiento', icon: '◎' },
      { id: 'bodegas', title: 'Bodegas', icon: '⌂' },
      { id: 'inventario', title: 'Inventario', icon: '▤' },
      { id: 'movimientos-inventario', title: 'Movimientos de inventario', icon: '⇄' },
    ],
  },
  {
    title: 'FINANZAS',
    items: [
      { id: 'facturas', title: 'Facturas', icon: '▤' },
      { id: 'pagos', title: 'Pagos', icon: '$' },
      { id: 'cuentas', title: 'Cuentas financieras', icon: '▣' },
      { id: 'movimientos', title: 'Movimientos', icon: '⇅' },
    ],
  },
];

const allNavigationItems = navigationGroups.flatMap(
  (group) => group.items
);

function NavigationItem({ item, active, onPress, compact }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navItem,
        active && styles.navItemActive,
        pressed && styles.navItemPressed,
      ]}
    >
      <Text style={[styles.navIcon, active && styles.navIconActive]}>
        {item.icon}
      </Text>

      {!compact && (
        <Text
          numberOfLines={1}
          style={[
            styles.navText,
            active && styles.navTextActive,
          ]}
        >
          {item.title}
        </Text>
      )}

      {active && !compact && <View style={styles.activeIndicator} />}
    </Pressable>
  );
}

function Sidebar({ activeScreen, onNavigate, onLogout, compact }) {
  return (
    <View style={[styles.sidebar, compact && styles.sidebarCompact]}>
      <View style={styles.sidebarBrand}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>N</Text>
        </View>

        {!compact && (
          <View>
            <Text style={styles.brandName}>NEXPORT</Text>
            <Text style={styles.brandCaption}>GESTIÓN DE EXPORTACIONES</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.navigationScroll}
        showsVerticalScrollIndicator={false}
      >
        {navigationGroups.map((group) => (
          <View key={group.title} style={styles.navGroup}>
            {!compact && (
              <Text style={styles.navGroupTitle}>{group.title}</Text>
            )}

            {group.items.map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                active={activeScreen === item.id}
                compact={compact}
                onPress={() => onNavigate(item.id)}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.sidebarFooter}>
        {!compact && (
          <View style={styles.sidebarFooterInfo}>
            <Text style={styles.sidebarFooterTitle}>Nexport</Text>
            <Text style={styles.sidebarFooterText}>
              Sistema administrativo
            </Text>
          </View>
        )}

        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [
            styles.logoutNavButton,
            pressed && styles.navItemPressed,
          ]}
        >
          <Text style={styles.logoutNavIcon}>↪</Text>
          {!compact && (
            <Text style={styles.logoutNavText}>Cerrar sesión</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function Dashboard({ perfil, onNavigate, isWide }) {
  const shortcuts = [
    {
      title: 'Clientes',
      description: 'Administración de clientes',
      id: 'clientes',
      icon: '♙',
    },
    {
      title: 'Exportaciones',
      description: 'Gestión de exportaciones',
      id: 'exportaciones',
      icon: '⇧',
    },
    {
      title: 'Inventario',
      description: 'Control de paquetes y bodegas',
      id: 'inventario',
      icon: '▣',
    },
    {
      title: 'Finanzas',
      description: 'Facturas y movimientos',
      id: 'facturas',
      icon: '$',
    },
  ];

  return (
    <ScrollView
      style={styles.dashboardScroll}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.dashboardWelcome}>
        <Text style={styles.dashboardEyebrow}>PANEL PRINCIPAL</Text>
        <Text style={styles.dashboardTitle}>
          Bienvenido, {perfil?.nombre || 'Administrador'}
        </Text>
        <Text style={styles.dashboardDescription}>
          Desde aquí puedes administrar las operaciones de Nexport.
        </Text>
      </View>

      <Text style={styles.sectionHeading}>Accesos directos</Text>

      <View style={styles.shortcutGrid}>
        {shortcuts.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onNavigate(item.id)}
            style={({ pressed }) => [
              styles.shortcutCard,
              { width: isWide ? '23.5%' : '48%' },
              pressed && styles.shortcutPressed,
            ]}
          >
            <View style={styles.shortcutIcon}>
              <Text style={styles.shortcutIconText}>{item.icon}</Text>
            </View>

            <Text style={styles.shortcutTitle}>{item.title}</Text>
            <Text style={styles.shortcutDescription}>
              {item.description}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.dashboardInformation}>
        <View style={styles.informationHeader}>
          <Text style={styles.informationTitle}>Sesión administrativa</Text>
          <View style={styles.accountStatus}>
            <View style={styles.accountStatusDot} />
            <Text style={styles.accountStatusText}>Activa</Text>
          </View>
        </View>

        <View style={styles.accountDetails}>
          <View style={styles.accountDetail}>
            <Text style={styles.accountDetailLabel}>Usuario</Text>
            <Text style={styles.accountDetailValue}>
              {perfil?.nombre || '—'}
            </Text>
          </View>

          <View style={styles.accountDetail}>
            <Text style={styles.accountDetailLabel}>Correo</Text>
            <Text style={styles.accountDetailValue}>
              {perfil?.correo || '—'}
            </Text>
          </View>

          <View style={styles.accountDetail}>
            <Text style={styles.accountDetailLabel}>Rol</Text>
            <Text style={styles.accountDetailValue}>Administrador</Text>
          </View>
        </View>
      </View>

      <Text style={styles.dashboardFooter}>
        NEXPORT · Sistema de gestión de exportaciones
      </Text>
    </ScrollView>
  );
}

function PlaceholderScreen({ screenId, onBack }) {
  const item = allNavigationItems.find((entry) => entry.id === screenId);

  return (
    <View style={styles.placeholderContainer}>
      <View style={styles.placeholderIcon}>
        <Text style={styles.placeholderIconText}>
          {item?.icon || '▦'}
        </Text>
      </View>

      <Text style={styles.placeholderTitle}>
        {item?.title || 'Módulo'}
      </Text>

      <Text style={styles.placeholderDescription}>
        Este módulo se incorporará a la estructura de Nexport durante el
        desarrollo.
      </Text>

      <Pressable onPress={onBack} style={styles.placeholderButton}>
        <Text style={styles.placeholderButtonText}>
          Volver al panel principal
        </Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  const { width } = useWindowDimensions();

  const isMobile = width < 768;
  const isWide = width >= 1100;

  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState('inicio');
  const [menuOpen, setMenuOpen] = useState(width >= 768);

  const requestId = useRef(0);

  useEffect(() => {
    if (isMobile) {
      setMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    let mounted = true;

    async function validateSession(currentSession) {
      const currentRequest = ++requestId.current;

      if (!currentSession) {
        if (mounted) {
          setSession(null);
          setPerfil(null);
          setActiveScreen('inicio');
          setLoading(false);
        }
        return;
      }

      if (mounted) {
        setSession(currentSession);
        setLoading(true);
      }

      try {
        const { data, error } = await supabase
          .from('perfiles_usuario')
          .select('id, nombre, correo, usuario, estado, roles(nombre)')
          .eq('id', currentSession.user.id)
          .single();

        if (error) throw error;

        if (
          data.estado !== 'Activo' ||
          data.roles?.nombre !== 'Administrador'
        ) {
          throw new Error(
            'Tu cuenta no tiene permisos de administrador activos.'
          );
        }

        if (mounted && currentRequest === requestId.current) {
          setPerfil(data);
        }
      } catch (error) {
        console.error('Validación de usuario:', error.message);

        if (mounted && currentRequest === requestId.current) {
          setPerfil(null);
          setSession(null);
          await supabase.auth.signOut();
        }
      } finally {
        if (mounted && currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        Promise.resolve().then(() => {
          if (mounted) validateSession(newSession);
        });
      }
    );

    async function initialize() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error recuperando sesión:', error.message);
        if (mounted) setLoading(false);
        return;
      }

      if (mounted) {
        await validateSession(data.session);
      }
    }

    initialize();

    return () => {
      mounted = false;
      requestId.current++;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(email, password) {
    const result = await authRepository.login(email, password);

    setSession({ user: result.user });
    setPerfil(result.perfil);
    setActiveScreen('inicio');
  }

  async function handleLogout() {
    try {
      setLoading(true);
      await authRepository.logout();
      setSession(null);
      setPerfil(null);
      setActiveScreen('inicio');
      setMenuOpen(false);
    } catch (error) {
      console.error('Error cerrando sesión:', error.message);
    } finally {
      setLoading(false);
    }
  }

  function navigateTo(screenId) {
    setActiveScreen(screenId);

    if (isMobile) {
      setMenuOpen(false);
    }
  }

  const activeItem = allNavigationItems.find(
    (item) => item.id === activeScreen
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Cargando Nexport...</Text>
      </View>
    );
  }

  if (!session || !perfil) {
    return (
      <>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  return (
    <View style={styles.appContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.navy}
      />

      <View style={styles.applicationBody}>
        {!isMobile && menuOpen && (
          <Sidebar
            activeScreen={activeScreen}
            onNavigate={navigateTo}
            onLogout={handleLogout}
          />
        )}

        <View style={styles.mainArea}>
          <View style={styles.topbar}>
            <Pressable
              onPress={() => setMenuOpen((current) => !current)}
              style={styles.menuButton}
              accessibilityRole="button"
              accessibilityLabel="Abrir menú de navegación"
            >
              <Text style={styles.menuButtonText}>
                {menuOpen && !isMobile ? '☰' : '☰'}
              </Text>
            </Pressable>

            <View style={styles.topbarTitle}>
              <Text style={styles.topbarHeading}>
                {activeScreen === 'inicio'
                  ? 'Panel principal'
                  : activeItem?.title || 'Nexport'}
              </Text>
              {!isMobile && (
                <Text style={styles.topbarSubtitle}>
                  Sistema de gestión de exportaciones
                </Text>
              )}
            </View>

            <View style={styles.topbarAccount}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(perfil.nombre || 'A').charAt(0).toUpperCase()}
                </Text>
              </View>

              {!isMobile && (
                <View style={styles.topbarUser}>
                  <Text style={styles.topbarUserName}>
                    {perfil.nombre}
                  </Text>
                  <Text style={styles.topbarUserRole}>
                    Administrador
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.screenContent}>
            {activeScreen === 'inicio' && (
              <Dashboard
                perfil={perfil}
                onNavigate={navigateTo}
                isWide={isWide}
              />
            )}

            {activeScreen === 'clientes' && <ClientesScreen />}

            {!['inicio', 'clientes'].includes(activeScreen) && (
              <PlaceholderScreen
                screenId={activeScreen}
                onBack={() => navigateTo('inicio')}
              />
            )}
          </View>
        </View>

        {isMobile && menuOpen && (
          <View style={styles.mobileDrawerOverlay}>
            <Pressable
              style={styles.drawerBackdrop}
              onPress={() => setMenuOpen(false)}
            />

            <View style={styles.mobileDrawer}>
              <Sidebar
                activeScreen={activeScreen}
                onNavigate={navigateTo}
                onLogout={handleLogout}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    minHeight: 0,
  },

  applicationBody: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
    position: 'relative',
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
    fontSize: 13,
  },

  sidebar: {
    width: 255,
    backgroundColor: COLORS.navy,
    height: '100%',
    flexDirection: 'column',
  },

  sidebarCompact: {
    width: 70,
    alignItems: 'center',
  },

  sidebarBrand: {
    height: 78,
    paddingHorizontal: 19,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#304154',
  },

  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 7,
    backgroundColor: '#315C85',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandMarkText: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: '800',
  },

  brandName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },

  brandCaption: {
    color: '#9BAABB',
    fontSize: 8,
    letterSpacing: 0.7,
    marginTop: 3,
  },

  navigationScroll: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 15,
  },

  navGroup: {
    marginBottom: 22,
  },

  navGroupTitle: {
    color: '#8494A6',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginHorizontal: 10,
    marginBottom: 9,
  },

  navItem: {
    height: 41,
    borderRadius: 6,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    position: 'relative',
  },

  navItemActive: {
    backgroundColor: COLORS.navyLight,
  },

  navItemPressed: {
    opacity: 0.7,
  },

  navIcon: {
    width: 25,
    textAlign: 'center',
    color: '#A9B7C6',
    fontSize: 17,
  },

  navIconActive: {
    color: '#FFFFFF',
  },

  navText: {
    color: '#C3CDD8',
    fontSize: 12,
    flex: 1,
    marginLeft: 7,
  },

  navTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },

  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: 9,
    bottom: 9,
    width: 3,
    backgroundColor: '#80A9CF',
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },

  sidebarFooter: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#304154',
  },

  sidebarFooterInfo: {
    marginBottom: 13,
    paddingHorizontal: 4,
  },

  sidebarFooterTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  sidebarFooterText: {
    color: '#91A1B2',
    fontSize: 10,
    marginTop: 3,
  },

  logoutNavButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    gap: 10,
  },

  logoutNavIcon: {
    color: '#D5A0A0',
    fontSize: 19,
    width: 22,
    textAlign: 'center',
  },

  logoutNavText: {
    color: '#E2C0C0',
    fontSize: 12,
  },

  mainArea: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    backgroundColor: COLORS.background,
  },

  topbar: {
    height: 68,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 23,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F4F7',
  },

  menuButtonText: {
    color: COLORS.text,
    fontSize: 20,
  },

  topbarTitle: {
    flex: 1,
  },

  topbarHeading: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },

  topbarSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  topbarAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 20,
    backgroundColor: '#E8EEF4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: COLORS.navy,
    fontWeight: '700',
    fontSize: 13,
  },

  topbarUser: {
    minWidth: 90,
  },

  topbarUserName: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
  },

  topbarUserRole: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  screenContent: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },

  dashboardScroll: {
    flex: 1,
  },

  dashboardContent: {
    padding: 26,
    paddingBottom: 35,
  },

  dashboardWelcome: {
    marginBottom: 30,
  },

  dashboardEyebrow: {
    color: COLORS.blue,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },

  dashboardTitle: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '700',
    marginTop: 9,
  },

  dashboardDescription: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 7,
    lineHeight: 20,
  },

  sectionHeading: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 13,
  },

  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  shortcutCard: {
    minWidth: 145,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 17,
    marginBottom: 2,
  },

  shortcutPressed: {
    opacity: 0.7,
  },

  shortcutIcon: {
    width: 37,
    height: 37,
    borderRadius: 7,
    backgroundColor: '#EAF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  shortcutIconText: {
    color: COLORS.blue,
    fontSize: 19,
  },

  shortcutTitle: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 13,
  },

  shortcutDescription: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
    lineHeight: 16,
  },

  dashboardInformation: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginTop: 24,
    padding: 18,
  },

  informationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  informationTitle: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 13,
  },

  accountStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF5EF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  accountStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 5,
    backgroundColor: '#247A55',
  },

  accountStatusText: {
    color: '#247A55',
    fontSize: 10,
    fontWeight: '600',
  },

  accountDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 25,
    paddingTop: 16,
  },

  accountDetail: {
    minWidth: 130,
    flex: 1,
  },

  accountDetailLabel: {
    color: COLORS.muted,
    fontSize: 10,
  },

  accountDetailValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },

  dashboardFooter: {
    textAlign: 'center',
    color: '#9AA5B1',
    fontSize: 10,
    marginTop: 28,
  },

  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },

  placeholderIcon: {
    width: 55,
    height: 55,
    borderRadius: 9,
    backgroundColor: '#E8EEF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  placeholderIconText: {
    fontSize: 25,
    color: COLORS.blue,
  },

  placeholderTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },

  placeholderDescription: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 350,
    lineHeight: 20,
    marginTop: 9,
  },

  placeholderButton: {
    backgroundColor: COLORS.navy,
    borderRadius: 6,
    paddingHorizontal: 17,
    paddingVertical: 11,
    marginTop: 22,
  },

  placeholderButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },

  mobileDrawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    flexDirection: 'row',
  },

  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 24, 38, 0.48)',
  },

  mobileDrawer: {
    width: 285,
    maxWidth: '85%',
    height: '100%',
    backgroundColor: COLORS.navy,
  },
});
