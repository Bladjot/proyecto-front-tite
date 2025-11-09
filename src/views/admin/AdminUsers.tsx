import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  mapUserRecord,
  normaliseRoleValue,
  type UserRecord,
  type RoleRecord,
  userService,
} from "../../db/services/userService";
import { formatRut, isRutFormatValid, normaliseRut, sanitiseRutInput } from "../../utils/rut";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
};

type UserFormState = {
  id?: string;
  name: string;
  lastName: string;
  email: string;
  rut: string;
  roles: string[];
  password: string;
};

const FALLBACK_ROLES = ["admin", "vendedor", "cliente", "moderador"];

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  vendedor: "Vendedor",
  cliente: "Cliente",
  moderador: "Moderador",
  user: "Cliente",
  usuario: "Cliente",
};

const defaultSnackState: SnackbarState = {
  open: false,
  message: "",
  severity: "info",
};

const buildEmptyFormState = (): UserFormState => ({
  id: undefined,
  name: "",
  lastName: "",
  email: "",
  rut: "",
  roles: ["cliente"],
  password: "",
});

const toFormState = (user: UserRecord): UserFormState => ({
  id: user.id,
  name: user.name,
  lastName: user.lastName,
  email: user.email,
  rut: user.rut ? formatRut(user.rut) : "",
  roles: Array.isArray(user.roles)
    ? user.roles
        .map((role) => normaliseRoleValue(role))
        .filter(Boolean)
    : [],
  password: "",
});

type VendorAccreditationRequest = {
  id?: string;
  _id?: string;
  userId?: string;
  storeName?: string;
  contactNumber?: string;
  companyRut?: string;
  status?: string;
  applicant?: {
    name?: string;
    lastName?: string;
    email?: string;
  };
};

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<UserFormState>(buildEmptyFormState());
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<SnackbarState>(defaultSnackState);
  const [roleCatalog, setRoleCatalog] = useState<RoleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorRequests, setVendorRequests] = useState<VendorAccreditationRequest[]>([]);
  const [vendorRequestsLoading, setVendorRequestsLoading] = useState(false);
  const [vendorRequestsError, setVendorRequestsError] = useState<string | null>(null);

  // Demo sin backend: habilita /admin con datos de ejemplo si no hay token
  const isDemoMode = useMemo(() => {
    try {
      const noToken = !localStorage.getItem("token");
      const qs = typeof window !== "undefined" ? window.location.search : "";
      const queryFlag = qs.includes("demoAdmin=true") || qs.includes("demoAdmin=1");
      return noToken || queryFlag;
    } catch {
      return true;
    }
  }, []);

  const currentUserIsAdmin = useMemo(() => {
    if (isDemoMode) return true;
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return false;
      const parsed = JSON.parse(rawUser);
      const parsedRoles = Array.isArray(parsed?.roles)
        ? parsed.roles.map((role: unknown) => normaliseRoleValue(role))
        : [];
      return parsedRoles.includes("admin");
    } catch (parseError) {
      console.warn("[admin] No se pudo determinar el rol del usuario actual", parseError);
      return false;
    }
  }, [isDemoMode]);

  const showSnack = (message: string, severity: SnackbarState["severity"]) => {
    setSnack({ open: true, message, severity });
  };

  const closeSnack = () => {
    setSnack((prev) => ({ ...prev, open: false }));
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (isDemoMode) {
        const demoUsers: UserRecord[] = [
          {
            id: "1",
            name: "Admin",
            lastName: "Demo",
            email: "admin@demo.local",
            rut: "12.345.678-9",
            roles: ["admin"],
          },
          {
            id: "2",
            name: "Vendedora",
            lastName: "Prueba",
            email: "vendedora@demo.local",
            rut: "9.876.543-2",
            roles: ["vendedor"],
          },
          {
            id: "3",
            name: "Cliente",
            lastName: "Ejemplo",
            email: "cliente@demo.local",
            rut: "7.654.321-0",
            roles: ["cliente"],
          },
        ];
        setUsers(demoUsers);
        return;
      }
      const data = await userService.getUsers();
      setUsers(data);
    } catch (cause: unknown) {
      console.error("[admin] Error al obtener usuarios:", cause);
      const message =
        isAxiosError(cause) && cause.response?.data?.message
          ? String(cause.response.data.message)
          : cause instanceof Error
          ? cause.message
          : "No se pudieron obtener los usuarios";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    if (!currentUserIsAdmin) {
      if (!isDemoMode) {
        navigate("/dashboard", { replace: true });
      }
      return;
    }
    fetchUsers();
  }, [currentUserIsAdmin, fetchUsers, navigate, isDemoMode]);

  useEffect(() => {
    if (!currentUserIsAdmin) return;

    const fetchRoles = async () => {
      try {
        if (isDemoMode) {
          const demoRoles: RoleRecord[] = FALLBACK_ROLES.map((r) => ({
            id: r,
            value: r,
            label: ROLE_LABELS[r] ?? r,
          }));
          setRoleCatalog(demoRoles);
          return;
        }
        const roles = await userService.getRoles();
        setRoleCatalog(roles);
      } catch (cause: unknown) {
        console.warn("[admin] No se pudieron cargar los roles disponibles", cause);
        setSnack({
          open: true,
          severity: "warning",
          message: "No se pudieron cargar los roles disponibles, usando valores por defecto",
        });
      }
    };

    fetchRoles();
  }, [currentUserIsAdmin, isDemoMode]);

  useEffect(() => {
    if (!currentUserIsAdmin) return;
    const fetchVendorRequests = async () => {
      try {
        setVendorRequestsLoading(true);
        setVendorRequestsError(null);
        if (isDemoMode) {
          setVendorRequests([
            {
              id: "req-1",
              userId: "2",
              storeName: "Tienda Demo",
              contactNumber: "+56 9 1234 5678",
              companyRut: "76.543.210-5",
              status: "pending",
              applicant: { name: "Vendedora", lastName: "Prueba", email: "vendedora@demo.local" },
            },
          ]);
          return;
        }
        const requests = await userService.getVendorAccreditations();
        setVendorRequests(requests);
      } catch (cause: unknown) {
        console.error("[admin] Error al obtener solicitudes de acreditación:", cause);
        const message =
          isAxiosError(cause) && cause.response?.data?.message
            ? String(cause.response.data.message)
            : cause instanceof Error
            ? cause.message
            : "No se pudieron obtener las solicitudes de acreditación";
        setVendorRequestsError(message);
      } finally {
        setVendorRequestsLoading(false);
      }
    };

    fetchVendorRequests();
    const interval = setInterval(fetchVendorRequests, 10000);
    return () => clearInterval(interval);
  }, [currentUserIsAdmin, isDemoMode]);

  const handleDeleteVendorRequest = async (id?: string) => {
    if (!id) return;
    const confirmed = window.confirm("¿Seguro que deseas eliminar esta solicitud?");
    if (!confirmed) return;
    try {
      if (isDemoMode) {
        setVendorRequests((prev) => prev.filter((request) => request.id !== id));
        showSnack("Solicitud eliminada (demo)", "success");
      } else {
        await userService.deleteVendorAccreditation(id);
        setVendorRequests((prev) => prev.filter((request) => request.id !== id));
        showSnack("Solicitud eliminada", "success");
      }
    } catch (cause: unknown) {
      console.error("[admin] Error al eliminar solicitud:", cause);
      if (isAxiosError(cause) && cause.response?.status === 404) {
        showSnack("Solicitud no encontrada", "warning");
      } else {
        const message =
          isAxiosError(cause) && cause.response?.data?.message
            ? String(cause.response.data.message)
            : cause instanceof Error
            ? cause.message
            : "No se pudo eliminar la solicitud";
        showSnack(message, "error");
      }
    }
  };

  const availableRoles = useMemo(() => {
    const roleSet = new Set(FALLBACK_ROLES);
    roleCatalog.forEach((role) => roleSet.add(normaliseRoleValue(role.value)));
    users.forEach((user) => {
      if (Array.isArray(user.roles)) {
        user.roles
          .map((role) => normaliseRoleValue(role))
          .forEach((role) => roleSet.add(role));
      }
    });
    const filtered = Array.from(roleSet).filter((role) => role !== "user" && role !== "usuario");
    return filtered.length ? filtered : ["cliente"];
  }, [users, roleCatalog]);

  const roleLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    roleCatalog.forEach((role) => {
      map.set(normaliseRoleValue(role.value), role.label);
    });
    Object.entries(ROLE_LABELS).forEach(([value, label]) => {
      if (!map.has(value)) {
        map.set(value, label);
      }
    });
    return map;
  }, [roleCatalog]);

  const getRoleLabel = useCallback(
    (role: string) => roleLabelMap.get(role.toLowerCase()) ?? role.toUpperCase(),
    [roleLabelMap]
  );

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    const query = searchTerm.trim().toLowerCase();
    const normalisedQuery = query.replace(/[.\-_\s]/g, "");

    return users.filter((user) => {
      const candidates = [
        user.id,
        user.email,
        user.rut,
        user.rut ? formatRut(user.rut) : null,
        user.name,
        user.lastName,
        `${user.name} ${user.lastName}`,
      ]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLowerCase());

      if (candidates.some((value) => value.includes(query))) {
        return true;
      }

      const normalisedRut = (user.rut ?? "").toLowerCase().replace(/[.\-_\s]/g, "");
      return normalisedRut.includes(normalisedQuery);
    });
  }, [users, searchTerm]);

  const handleOpenCreate = () => {
    setFormState(buildEmptyFormState());
    setDialogOpen(true);
  };

  const handleOpenEdit = (user: UserRecord) => {
    setFormState(toFormState(user));
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormState(buildEmptyFormState());
  };

  const validateForm = (data: UserFormState) => {
    if (!data.name.trim()) return "El nombre es obligatorio";
    if (!data.lastName.trim()) return "El apellido es obligatorio";
    const email = data.email.trim().toLowerCase();
    if (!email) return "El correo es obligatorio";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Formato de correo inválido";
    if (!data.roles.length) return "Selecciona al menos un rol";
    if (data.rut.trim() && !isRutFormatValid(data.rut.trim())) {
      return "El RUT debe tener el formato XX.XXX.XXX-Y";
    }
    if (!data.id && data.password.trim().length < 6) {
      return "La contraseña debe tener mínimo 6 caracteres";
    }
    if (data.id && data.password && data.password.trim().length > 0 && data.password.trim().length < 6) {
      return "La contraseña debe tener mínimo 6 caracteres";
    }
    return null;
  };

  const handleSaveUser = async () => {
    const validationError = validateForm(formState);
    if (validationError) {
      showSnack(validationError, "warning");
      return;
    }

    const payload: Record<string, unknown> = {
      name: formState.name.trim(),
      lastName: formState.lastName.trim(),
      email: formState.email.trim().toLowerCase(),
      rut: normaliseRut(formState.rut) || undefined,
      roles: formState.roles,
    };
    if (formState.password.trim().length > 0) {
      const newPassword = formState.password.trim();
      payload.password = newPassword;
      payload.newPassword = newPassword;
      payload.passwordConfirmation = newPassword;
      payload.password_confirmation = newPassword;
      payload.confirmPassword = newPassword;
      payload.password_confirm = newPassword;
    }

    try {
      setSaving(true);
      if (isDemoMode) {
        if (formState.id) {
          setUsers((prev) =>
            prev.map((u) => (u.id === formState.id ? { ...u, ...(payload as any) } : u))
          );
          showSnack("Usuario actualizado (demo)", "success");
        } else {
          const newId = String(Date.now());
          const newUser: UserRecord = {
            id: newId,
            name: String(payload.name || ""),
            lastName: String(payload.lastName || ""),
            email: String(payload.email || ""),
            rut: (payload.rut as string) || "",
            roles: Array.isArray(payload.roles) ? (payload.roles as string[]) : ["cliente"],
          };
          setUsers((prev) => [...prev, newUser]);
          showSnack("Usuario creado (demo)", "success");
        }
        handleCloseDialog();
      } else {
        if (formState.id) {
          const updated = await userService.updateUser(formState.id, payload);
          const mapped = mapUserRecord(updated);
          setUsers((prev) =>
            prev.map((user) => (user.id === mapped.id ? mapped : user))
          );
          showSnack("Usuario actualizado", "success");
        } else {
          const created = await userService.createUser(payload);
          setUsers((prev) => [...prev, created]);
          showSnack("Usuario creado", "success");
        }
        handleCloseDialog();
      }
    } catch (cause: unknown) {
      console.error("[admin] Error al guardar usuario:", cause);
      const message =
        isAxiosError(cause) && cause.response?.data?.message
          ? String(cause.response.data.message)
          : cause instanceof Error
          ? cause.message
          : "No se pudo guardar el usuario";
      showSnack(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const confirmed = window.confirm("¿Seguro que deseas eliminar este usuario?");
    if (!confirmed) return;
    try {
      if (isDemoMode) {
        setUsers((prev) => prev.filter((user) => user.id !== id));
        showSnack("Usuario eliminado (demo)", "success");
      } else {
        await userService.deleteUser(id);
        setUsers((prev) => prev.filter((user) => user.id !== id));
        showSnack("Usuario eliminado", "success");
      }
    } catch (cause: unknown) {
      console.error("[admin] Error al eliminar usuario:", cause);
      const message =
        isAxiosError(cause) && cause.response?.data?.message
          ? String(cause.response.data.message)
          : cause instanceof Error
          ? cause.message
          : "No se pudo eliminar el usuario";
      showSnack(message, "error");
    }
  };

  const handleBackToMenu = () => {
    localStorage.setItem("redirectTo", "/dashboard");
    navigate("/dashboard", { replace: true });
  };

  if (!currentUserIsAdmin) {
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6, px: { xs: 2, md: 6 } }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        gap={3}
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Administración de usuarios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Crea, edita o elimina usuarios de la plataforma.
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
          <TextField
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por RUT, ID, correo o nombre"
            size="small"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: "100%", sm: 260 }, bgcolor: "white" }}
          />
          <Button variant="outlined" color="secondary" startIcon={<HomeIcon />} onClick={handleBackToMenu}>
            Volver al menú
          </Button>
          <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenCreate}>
            Nuevo usuario
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ maxWidth: 520 }}>
          {error}
        </Alert>
      ) : (
        <Paper elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>RUT</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {user.name} {user.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {user.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.rut ? formatRut(user.rut) : "—"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {user.roles.length ? (
                          user.roles.map((role) => (
                            <Chip key={role} label={getRoleLabel(role)} size="small" />
                          ))
                        ) : (
                          <Chip label="Sin rol" size="small" color="warning" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenEdit(user)} size="small">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteUser(user.id)} size="small" color="error">
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography textAlign="center" py={4} color="text.secondary">
                      {users.length
                        ? "No se encontraron usuarios que coincidan con la búsqueda."
                        : "No hay usuarios registrados."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{formState.id ? "Editar usuario" : "Crear nuevo usuario"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Nombre"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Apellidos"
                value={formState.lastName}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, lastName: event.target.value }))
                }
                fullWidth
              />
            </Stack>
            <TextField
              label="Correo electrónico"
              type="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, email: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="RUT"
              value={formState.rut}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  rut: sanitiseRutInput(event.target.value),
                }))
              }
              fullWidth
              placeholder="12.345.678-9"
              error={formState.rut.trim().length > 0 && !isRutFormatValid(formState.rut)}
              helperText={
                formState.rut.trim().length > 0 && !isRutFormatValid(formState.rut)
                  ? "Formato requerido: 12.345.678-9"
                  : " "
              }
            />
            <FormControl fullWidth>
              <InputLabel id="roles-label">Roles</InputLabel>
              <Select
                labelId="roles-label"
                multiple
                value={formState.roles}
                input={<OutlinedInput label="Roles" />}
                renderValue={(selected) =>
                  selected.map((role) => getRoleLabel(role)).join(", ")
                }
                onChange={(event) => {
                  const value = event.target.value;
                  setFormState((prev) => ({
                    ...prev,
                    roles: typeof value === "string" ? value.split(",") : (value as string[]),
                  }));
                }}
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {getRoleLabel(role)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={formState.id ? "Actualizar contraseña" : "Contraseña"}
              type="password"
              value={formState.password}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, password: event.target.value }))
              }
              fullWidth
              helperText={
                formState.id
                  ? "Deja en blanco para mantener la contraseña actual"
                  : "La contraseña debe tener al menos 6 caracteres"
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSaveUser} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={closeSnack}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>

      <Paper elevation={1} sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Solicitudes de verificación de cuenta
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Revisa los datos entregados por quienes desean vender en la plataforma y valida su
          información antes de aprobarlos.
        </Typography>
        {vendorRequestsLoading ? (
          <Stack alignItems="center" py={3}>
            <CircularProgress size={28} />
          </Stack>
        ) : vendorRequestsError ? (
          <Alert severity="error">{vendorRequestsError}</Alert>
        ) : vendorRequests.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay solicitudes pendientes.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {vendorRequests.map((request, index) => (
              <Box
                key={request.id || index}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box>
                  <Typography fontWeight={600}>
                    {request.applicant?.name} {request.applicant?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {request.applicant?.email || "Sin correo asignado"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Estado: {request.status ?? "pending"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Usuario solicitante: {request.userId || "N/D"}
                  </Typography>
                </Box>
                <Stack spacing={0.5} flex={1}>
                  <Typography variant="body2">
                    <Box component="span" fontWeight={600}>
                      Nombre de tienda:
                    </Box>{" "}
                    {request.storeName || "—"}
                  </Typography>
                  <Typography variant="body2">
                    <Box component="span" fontWeight={600}>
                      Número de contacto:
                    </Box>{" "}
                    {request.contactNumber || "—"}
                  </Typography>
                  <Typography variant="body2">
                    <Box component="span" fontWeight={600}>
                      RUT empresa:
                    </Box>{" "}
                    {request.companyRut || "—"}
                  </Typography>
                </Stack>
                <Stack spacing={1} direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteVendorRequest(request.id || request._id)}
                  >
                    Eliminar
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}

export default AdminUsers;
