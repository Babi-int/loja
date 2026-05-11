import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import { useAuth } from "./context/AuthContext";
import CustomerForm from "./pages/CustomerForm";
import CustomerList from "./pages/CustomerList";
import Dashboard from "./pages/Dashboard";
import FinanceReport from "./pages/FinanceReport";
import Login from "./pages/Login";
import ProductForm from "./pages/ProductForm";
import ProductList from "./pages/ProductList";
import SaleForm from "./pages/SaleForm";
import SaleHistory from "./pages/SaleHistory";
import Settings from "./pages/Settings";

/** Área logada: sem token, redireciona para /login (substitui o histórico). */
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/produtos" element={<ProductList />} />
        <Route path="/produtos/novo" element={<ProductForm />} />
        <Route path="/produtos/:id" element={<ProductForm />} />
        <Route path="/clientes" element={<CustomerList />} />
        <Route path="/clientes/novo" element={<CustomerForm />} />
        <Route path="/clientes/:id" element={<CustomerForm />} />
        <Route path="/vendas/nova" element={<SaleForm />} />
        <Route path="/vendas" element={<SaleHistory />} />
        <Route path="/financeiro" element={<FinanceReport />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
