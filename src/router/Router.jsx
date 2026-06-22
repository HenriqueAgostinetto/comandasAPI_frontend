import { Routes, Route } from "react-router-dom";

const ProdutoList = lazy(() => import("../pages/ProdutoList"));
const ProdutoForm = lazy(() => import("../pages/ProdutoForm"));
const CaixaDashboard = lazy(() => import("../pages/CaixaDashboard"));
const CaixaRecebimento = lazy(() => import("../pages/CaixaRecebimento"));
const CaixaComprovante = lazy(() => import("../pages/CaixaComprovante"));

function AppRouter() {
  return (
    <Routes>


      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />


      <Route path="/produtos" element={<PrivateRoute><ProdutoList /></PrivateRoute>} />
      <Route path="/produto" element={<PrivateRoute><ProdutoForm /></PrivateRoute>} />
      <Route path="/produto/:opr/:id" element={<PrivateRoute><ProdutoForm /></PrivateRoute>} />

      <Route path="/recebimento/dashboard" element={<PrivateRoute><CaixaDashboard /></PrivateRoute>} />
      <Route path="/recebimento/pagar" element={<PrivateRoute><CaixaRecebimento /></PrivateRoute>} />
      <Route path="/recebimento/comprovante/:id" element={<PrivateRoute><CaixaComprovante /></PrivateRoute>} />


      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default AppRouter;
