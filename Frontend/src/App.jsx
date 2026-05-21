import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Audit from "./pages/Audit";
import Result from "./pages/Result";
import NotFound from "./pages/NotFound";
import MainLayout from "./layout/MainLayout";

const App = () => {
  return (
    <MainLayout>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/result" element={<Result />} />

        {/* fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
};

export default App;


