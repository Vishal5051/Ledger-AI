const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");

router.post("/", auditController.createAudit);
router.get("/:id", auditController.getAuditById);

module.exports = router;
