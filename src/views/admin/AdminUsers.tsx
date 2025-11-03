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
import LogoutIcon from "@mui/icons-material/Logout";
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
  rut: user.rut ?? "",
  roles: Array.isArray(user.roles)
    ? user.roles
        .map((role) => normaliseRoleValue(role))
        .filter(Boolean)
    : [],
  password: "",
});

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

  const currentUserIsAdmin = useMemo(() => {
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
  }, []);

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
  }, []);

  useEffect(() => {
    if (!currentUserIsAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }
    fetchUsers();
  }, [currentUserIsAdmin, fetchUsers, navigate]);

  useEffect(() => {
    if (!currentUserIsAdmin) return;

    const fetchRoles = async () => {
      try {
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
  }, [currentUserIsAdmin]);

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
      rut: formState.rut.trim() || undefined,
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
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      showSnack("Usuario eliminado", "success");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("redirectTo");
    navigate("/auth/login", { replace: true });
  };

  if (!currentUserIsAdmin) {
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", py: 6, px: { xs: 2, md: 6 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Administración de usuarios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Crea, edita o elimina usuarios de la plataforma.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Cerrar sesión
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
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {user.name} {user.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.rut || "—"}</TableCell>
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
              ))}
              {!users.length && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography textAlign="center" py={4} color="text.secondary">
                      No hay usuarios registrados.
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
                setFormState((prev) => ({ ...prev, rut: event.target.value }))
              }
              fullWidth
              placeholder="12.345.678-9"
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
    </Box>
  );
}

export default AdminUsers;
