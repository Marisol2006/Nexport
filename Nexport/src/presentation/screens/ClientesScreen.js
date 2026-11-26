
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { supabase } from '../../infrastructure/supabase/supabaseClient';

const EMPTY_FORM = {
  nombre: '',
  empresa: '',
  ruc_documento: '',
  telefono: '',
  correo: '',
  direccion: '',
  ciudad: '',
  departamento: '',
  estado: 'Activo',
};

const COLORS = {
  navy: '#172638',
  blue: '#315C85',
  background: '#F4F6F8',
  white: '#FFFFFF',
  text: '#263445',
  muted: '#788697',
  border: '#E1E6EC',
  green: '#247A55',
  red: '#B54747',
  lightGreen: '#EAF5EF',
  lightRed: '#FBEFEF',
};

export default function ClientesScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const isCompact = width < 600;

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [notice, setNotice] = useState(null);

  const showNotice = (message, type = 'success') => {
    setNotice({ message, type });
  };

  const loadClientes = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('clientes')
      .select(
        'id, nombre, empresa, ruc_documento, telefono, correo, direccion, ciudad, departamento, estado, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      showNotice('No se pudieron cargar los clientes: ' + error.message, 'error');
    } else {
      setClientes(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const filteredClientes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return clientes.filter((cliente) => {
      const matchesStatus =
        filter === 'Todos' || cliente.estado === filter;

      const searchable = [
        cliente.nombre,
        cliente.empresa,
        cliente.ruc_documento,
        cliente.telefono,
        cliente.correo,
        cliente.ciudad,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && (!term || searchable.includes(term));
    });
  }, [clientes, search, filter]);

  const activeCount = clientes.filter(
    (cliente) => cliente.estado === 'Activo'
  ).length;

  const inactiveCount = clientes.filter(
    (cliente) => cliente.estado === 'Inactivo'
  ).length;

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEditModal = (cliente) => {
    setEditingId(cliente.id);
    setForm({
      nombre: cliente.nombre || '',
      empresa: cliente.empresa || '',
      ruc_documento: cliente.ruc_documento || '',
      telefono: cliente.telefono || '',
      correo: cliente.correo || '',
      direccion: cliente.direccion || '',
      ciudad: cliente.ciudad || '',
      departamento: cliente.departamento || '',
      estado: cliente.estado || 'Activo',
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    if (!saving) {
      setModalVisible(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  };

  const saveCliente = async () => {
    if (!form.nombre.trim()) {
      showNotice('El nombre del cliente es obligatorio.', 'error');
      return;
    }

    setSaving(true);

    const payload = {
      nombre: form.nombre.trim(),
      empresa: form.empresa.trim() || null,
      ruc_documento: form.ruc_documento.trim() || null,
      telefono: form.telefono.trim() || null,
      correo: form.correo.trim() || null,
      direccion: form.direccion.trim() || null,
      ciudad: form.ciudad.trim() || null,
      departamento: form.departamento.trim() || null,
      estado: form.estado,
    };

    let result;

    if (editingId) {
      result = await supabase
        .from('clientes')
        .update(payload)
        .eq('id', editingId)
        .select()
        .single();
    } else {
      result = await supabase
        .from('clientes')
        .insert(payload)
        .select()
        .single();
    }

    setSaving(false);

    if (result.error) {
      showNotice('No se pudo guardar el cliente: ' + result.error.message, 'error');
      return;
    }

    setModalVisible(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    showNotice(editingId ? 'Cliente actualizado correctamente.' : 'Cliente registrado correctamente.');
    await loadClientes();
  };

  const changeStatus = async (cliente) => {
    const nextStatus = cliente.estado === 'Activo' ? 'Inactivo' : 'Activo';

    const { error } = await supabase
      .from('clientes')
      .update({ estado: nextStatus })
      .eq('id', cliente.id);

    if (error) {
      showNotice('No se pudo cambiar el estado: ' + error.message, 'error');
      return;
    }

    showNotice(
      nextStatus === 'Activo'
        ? 'Cliente activado correctamente.'
        : 'Cliente desactivado correctamente.'
    );

    await loadClientes();
  };

  const Field = ({ label, value, onChangeText, placeholder, multiline }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || ''}
        placeholderTextColor="#A0AAB5"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multilineInput]}
        autoCapitalize="none"
      />
    </View>
  );

  const StatusBadge = ({ status }) => (
    <View
      style={[
        styles.statusBadge,
        status === 'Activo' ? styles.activeBadge : styles.inactiveBadge,
      ]}
    >
      <View
        style={[
          styles.statusDot,
          { backgroundColor: status === 'Activo' ? COLORS.green : COLORS.red },
        ]}
      />
      <Text
        style={[
          styles.statusText,
          { color: status === 'Activo' ? COLORS.green : COLORS.red },
        ]}
      >
        {status}
      </Text>
    </View>
  );

  const renderClient = (cliente) => (
    <View key={cliente.id} style={styles.clientCard}>
      <View style={styles.clientMain}>
        <View style={styles.clientAvatar}>
          <Text style={styles.avatarText}>
            {(cliente.nombre || 'C').trim().charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.clientIdentity}>
          <Text style={styles.clientName}>{cliente.nombre}</Text>
          <Text style={styles.clientCompany}>
            {cliente.empresa || 'Cliente particular'}
          </Text>
        </View>

        {!isCompact && <StatusBadge status={cliente.estado} />}
      </View>

      <View style={styles.clientDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Teléfono</Text>
          <Text style={styles.detailValue}>{cliente.telefono || '—'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Correo</Text>
          <Text style={styles.detailValue}>{cliente.correo || '—'}</Text>
        </View>
        {!isCompact && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Ciudad</Text>
            <Text style={styles.detailValue}>{cliente.ciudad || '—'}</Text>
          </View>
        )}
      </View>

      {isCompact && (
        <View style={styles.mobileStatus}>
          <StatusBadge status={cliente.estado} />
        </View>
      )}

      <View style={styles.clientActions}>
        <Pressable
          onPress={() => openEditModal(cliente)}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Text style={styles.editAction}>Editar</Text>
        </Pressable>

        <Pressable
          onPress={() => changeStatus(cliente)}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Text
            style={[
              styles.statusAction,
              { color: cliente.estado === 'Activo' ? COLORS.red : COLORS.green },
            ]}
          >
            {cliente.estado === 'Activo' ? 'Desactivar' : 'Activar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.heading}>
        <View>
          <Text style={styles.pageTitle}>Clientes</Text>
          <Text style={styles.pageSubtitle}>
            Administra la información de tus clientes.
          </Text>
        </View>

        <Pressable
          onPress={openNewModal}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
            isCompact && styles.compactPrimaryButton,
          ]}
        >
          <Text style={styles.primaryButtonText}>+ Nuevo cliente</Text>
        </Pressable>
      </View>

      {notice && (
        <View
          style={[
            styles.notice,
            notice.type === 'error' ? styles.errorNotice : styles.successNotice,
          ]}
        >
          <Text
            style={[
              styles.noticeText,
              { color: notice.type === 'error' ? COLORS.red : COLORS.green },
            ]}
          >
            {notice.message}
          </Text>
          <Pressable onPress={() => setNotice(null)}>
            <Text style={styles.noticeClose}>Cerrar</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.statsRow, isCompact && styles.statsRowCompact]}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total de clientes</Text>
          <Text style={styles.statNumber}>{clientes.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Activos</Text>
          <Text style={[styles.statNumber, { color: COLORS.green }]}>
            {activeCount}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Inactivos</Text>
          <Text style={[styles.statNumber, { color: COLORS.muted }]}>
            {inactiveCount}
          </Text>
        </View>
      </View>

      <View style={styles.listPanel}>
        <View style={[styles.listToolbar, isCompact && styles.listToolbarCompact]}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nombre, empresa, teléfono..."
              placeholderTextColor="#98A3AF"
              style={styles.searchInput}
            />
          </View>

          <View style={styles.filters}>
            {['Todos', 'Activo', 'Inactivo'].map((item) => (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                style={[
                  styles.filterButton,
                  filter === item && styles.filterButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item && styles.filterTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.blue} />
            <Text style={styles.emptyText}>Cargando clientes...</Text>
          </View>
        ) : filteredClientes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No hay clientes para mostrar</Text>
            <Text style={styles.emptyText}>
              {search || filter !== 'Todos'
                ? 'Prueba cambiando los filtros de búsqueda.'
                : 'Los clientes que registres aparecerán en esta sección.'}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.clientList}
            contentContainerStyle={styles.clientListContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredClientes.map(renderClient)}
          </ScrollView>
        )}

        <View style={styles.listFooter}>
          <Text style={styles.footerText}>
            {filteredClientes.length} de {clientes.length} clientes
          </Text>
          <Pressable onPress={loadClientes} style={styles.refreshButton}>
            <Text style={styles.refreshText}>Actualizar listado</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalContainer,
              isWide && styles.modalContainerWide,
              isCompact && styles.modalContainerCompact,
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingId ? 'Editar cliente' : 'Nuevo cliente'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Completa la información del cliente.
                </Text>
              </View>
              <Pressable onPress={closeModal} disabled={saving}>
                <Text style={styles.modalClose}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={[styles.formGrid, !isCompact && styles.formGridWide]}>
                <View style={styles.formColumn}>
                  <Field
                    label="Nombre *"
                    value={form.nombre}
                    onChangeText={(v) => updateField('nombre', v)}
                    placeholder="Nombre completo"
                  />
                  <Field
                    label="Empresa"
                    value={form.empresa}
                    onChangeText={(v) => updateField('empresa', v)}
                    placeholder="Nombre de la empresa"
                  />
                  <Field
                    label="RUC / Documento"
                    value={form.ruc_documento}
                    onChangeText={(v) => updateField('ruc_documento', v)}
                    placeholder="Número de identificación"
                  />
                  <Field
                    label="Teléfono"
                    value={form.telefono}
                    onChangeText={(v) => updateField('telefono', v)}
                    placeholder="Número de contacto"
                  />
                </View>

                <View style={styles.formColumn}>
                  <Field
                    label="Correo electrónico"
                    value={form.correo}
                    onChangeText={(v) => updateField('correo', v)}
                    placeholder="correo@ejemplo.com"
                  />
                  <Field
                    label="Ciudad"
                    value={form.ciudad}
                    onChangeText={(v) => updateField('ciudad', v)}
                    placeholder="Ciudad"
                  />
                  <Field
                    label="Departamento"
                    value={form.departamento}
                    onChangeText={(v) => updateField('departamento', v)}
                    placeholder="Departamento"
                  />
                  <Field
                    label="Dirección"
                    value={form.direccion}
                    onChangeText={(v) => updateField('direccion', v)}
                    placeholder="Dirección del cliente"
                    multiline
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Estado del cliente</Text>
                <View style={styles.statusOptions}>
                  {['Activo', 'Inactivo'].map((status) => (
                    <Pressable
                      key={status}
                      onPress={() => updateField('estado', status)}
                      style={[
                        styles.statusOption,
                        form.estado === status && styles.statusOptionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          form.estado === status && styles.statusOptionTextSelected,
                        ]}
                      >
                        {status}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                onPress={closeModal}
                disabled={saving}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={saveCliente}
                disabled={saving}
                style={[styles.saveButton, saving && styles.disabledButton]}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingId ? 'Guardar cambios' : 'Registrar cliente'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 22,
    minHeight: 0,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 22,
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: COLORS.text,
  },
  pageSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 5,
  },
  primaryButton: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 7,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.82,
  },
  compactPrimaryButton: {
    paddingHorizontal: 13,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  notice: {
    padding: 12,
    borderRadius: 7,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  successNotice: {
    backgroundColor: COLORS.lightGreen,
  },
  errorNotice: {
    backgroundColor: COLORS.lightRed,
  },
  noticeText: {
    fontSize: 13,
    flex: 1,
  },
  noticeClose: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 13,
    marginBottom: 18,
  },
  statsRowCompact: {
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 15,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.muted,
  },
  statNumber: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 7,
  },
  listPanel: {
    flex: 1,
    minHeight: 280,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    overflow: 'hidden',
  },
  listToolbar: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  listToolbarCompact: {
    alignItems: 'stretch',
  },
  searchBox: {
    flex: 1,
    minWidth: 180,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 22,
    color: COLORS.muted,
    marginRight: 7,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    outlineStyle: 'none',
  },
  filters: {
    flexDirection: 'row',
    gap: 5,
  },
  filterButton: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 5,
    backgroundColor: '#F2F4F6',
  },
  filterButtonSelected: {
    backgroundColor: COLORS.navy,
  },
  filterText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  filterTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  clientList: {
    flex: 1,
  },
  clientListContent: {
    padding: 13,
    gap: 10,
  },
  clientCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 7,
    padding: 14,
    gap: 13,
  },
  clientMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  clientAvatar: {
    width: 38,
    height: 38,
    borderRadius: 7,
    backgroundColor: '#EAF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.navy,
    fontWeight: '700',
    fontSize: 16,
  },
  clientIdentity: {
    flex: 1,
  },
  clientName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  clientCompany: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: COLORS.lightGreen,
  },
  inactiveBadge: {
    backgroundColor: COLORS.lightRed,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  clientDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingLeft: 49,
  },
  detailItem: {
    minWidth: 100,
    flex: 1,
  },
  detailLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginBottom: 4,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 12,
  },
  mobileStatus: {
    paddingLeft: 49,
  },
  clientActions: {
    borderTopWidth: 1,
    borderTopColor: '#EDF0F3',
    paddingTop: 9,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 17,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  pressed: {
    opacity: 0.55,
  },
  editAction: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '600',
  },
  statusAction: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 7,
    textAlign: 'center',
  },
  listFooter: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 11,
  },
  refreshButton: {
    padding: 4,
  },
  refreshText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 27, 40, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '92%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalContainerWide: {
    maxWidth: 820,
  },
  modalContainerCompact: {
    maxHeight: '96%',
  },
  modalHeader: {
    paddingHorizontal: 22,
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
  modalClose: {
    color: COLORS.muted,
    fontSize: 28,
    paddingHorizontal: 5,
  },
  formScroll: {
    flexShrink: 1,
  },
  formContent: {
    padding: 22,
    gap: 15,
  },
  formGrid: {
    gap: 0,
  },
  formGridWide: {
    flexDirection: 'row',
    gap: 18,
  },
  formColumn: {
    flex: 1,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 7,
  },
  input: {
    minHeight: 41,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 11,
    paddingVertical: 9,
    color: COLORS.text,
    fontSize: 13,
    backgroundColor: COLORS.white,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  multilineInput: {
    minHeight: 70,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusOptionSelected: {
    backgroundColor: '#EAF0F5',
    borderColor: COLORS.blue,
  },
  statusOptionText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  statusOptionTextSelected: {
    color: COLORS.navy,
    fontWeight: '700',
  },
  modalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 9,
  },
  cancelButton: {
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 6,
    backgroundColor: '#F0F2F4',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    minWidth: 135,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 6,
    backgroundColor: COLORS.navy,
  },
  disabledButton: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
