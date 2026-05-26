const Lead = require("../models/Lead");
const nodemailer = require("nodemailer");
const { getDbStatus } = require("../config/db");

// @desc    Create lead and dispatch report email
// @route   POST /api/leads
exports.createLead = async (req, res) => {
  try {
    const {
      name,
      email,
      auditId,
      teamSize,
      globalUseCase,
      tools,
      totalMonthlySpend,
      totalEstimatedSavings
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Missing required parameters: name and email are mandatory." });
    }

    const isConnected = getDbStatus();
    let savedLead = null;

    if (isConnected) {
      try {
        const newLead = new Lead({
          name,
          email,
          auditId,
          teamSize: parseInt(teamSize, 10) || 5,
          globalUseCase: globalUseCase || "mixed",
          tools: Array.isArray(tools) ? tools : [],
          totalMonthlySpend: parseFloat(totalMonthlySpend) || 0,
          totalEstimatedSavings: parseFloat(totalEstimatedSavings) || 0
        });
        savedLead = await newLead.save();
        console.log(`Lead successfully saved to database: ${email}`);
      } catch (dbErr) {
        console.error("Database save failed:", dbErr.message);
      }
    } else {
      console.log(`Simulation Mode: Capturing lead in memory only: ${email}`);
    }

    // Nodemailer SMTP dispatch (Option A Resend/Ethereal support)
    let transporter;
    let etherealUrl = null;
    const useCustomSmtp =
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS;

    if (useCustomSmtp) {
      console.log("Configuring production SMTP mail transporter.");
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: parseInt(process.env.SMTP_PORT, 10) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      console.log("No SMTP credentials detected. Provisioning Ethereal Test Mailer.");
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const annualSavings = (parseFloat(totalEstimatedSavings) || 0) * 12;
    const optimizedSpend = Math.max(0, (parseFloat(totalMonthlySpend) || 0) - (parseFloat(totalEstimatedSavings) || 0));

    let toolsRowsHtml = "";
    if (Array.isArray(tools) && tools.length > 0) {
      tools.forEach((item) => {
        const isOptimized = item.potentialSavings > 0;
        const toolLabel = item.tool.charAt(0).toUpperCase() + item.tool.slice(1);
        toolsRowsHtml += `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 8px; font-weight: bold; color: #1e293b;">${toolLabel}</td>
            <td style="padding: 12px 8px; color: #475569;">${item.plan}</td>
            <td style="padding: 12px 8px; text-align: center; color: #475569;">${item.seats}</td>
            <td style="padding: 12px 8px; font-weight: 600; color: #1e293b;">$${item.spend}/mo</td>
            <td style="padding: 12px 8px; text-align: right;">
              ${
                isOptimized
                  ? `<span style="color: #ea580c; font-weight: 600;">🔄 Downgrade to ${item.bestPlan} (Save $${item.potentialSavings}/mo)</span>`
                  : `<span style="color: #16a34a; font-weight: 600;">✓ Optimized (Keep Plan)</span>`
              }
            </td>
          </tr>
        `;
      });
    } else {
      toolsRowsHtml = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #64748b;">No tools configured in this audit.</td></tr>`;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Credex AI Auditor 💰" <noreply@ai-ledger.local>`,
      to: email,
      subject: `📈 Your B2B AI Stack Audit Report — Save $${annualSavings.toLocaleString()}/yr!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>AI Stack Audit Report</title>
          <style>
            body { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #334155; }
            .container { max-width: 650px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 40px 30px; text-align: center; }
            .logo { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
            .badge { background: #8b5cf6; color: #ffffff; padding: 6px 12px; font-size: 12px; border-radius: 9999px; font-weight: 700; display: inline-block; text-transform: uppercase; margin-bottom: 12px; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 10px; }
            .intro { color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
            .metrics-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 12px 0; margin-bottom: 30px; }
            .metric-card { display: table-cell; width: 33.33%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 15px; text-align: center; }
            .metric-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 8px; }
            .metric-value { font-size: 20px; font-weight: 800; margin: 0; }
            .value-danger { color: #ef4444; }
            .value-success { color: #22c55e; }
            .value-accent { color: #8b5cf6; }
            .portfolio-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; border-left: 4px solid #8b5cf6; padding-left: 10px; }
            .table-container { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 30px; }
            .portfolio-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
            .th-header { background: #f8fafc; color: #475569; font-weight: 700; padding: 12px 8px; border-bottom: 2px solid #e2e8f0; }
            .cta-block { text-align: center; margin-top: 40px; margin-bottom: 20px; }
            .btn { background: #8b5cf6; color: #ffffff !important; padding: 14px 30px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 15px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
            .footer { background: #f8fafc; padding: 30px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="badge">SaaS Spend Optimization</span>
              <div class="logo">LedgerAI Cost Audit Results 💰</div>
              <p style="margin: 0; color: #94a3b8; font-size: 14px;">Telemetry-Verified Cost-Saving Report</p>
            </div>
            
            <div class="content">
              <h2 class="greeting">Hi ${name},</h2>
              <p class="intro">
                We have completed auditing your company's AI tools subscription portfolio. By applying rule-based seat adjustments, minimum seating consolidation, and usage-based billing bands, you can optimize your stack and secure substantial annual cash flow.
              </p>
              
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-label">Current Spend</div>
                  <h4 class="metric-value value-danger">$${parseFloat(totalMonthlySpend).toLocaleString()}/mo</h4>
                </div>
                <div class="metric-card">
                  <div class="metric-label">Optimized Spend</div>
                  <h4 class="metric-value value-success">$${optimizedSpend.toLocaleString()}/mo</h4>
                </div>
                <div class="metric-card" style="background: rgba(139, 92, 246, 0.05); border-color: rgba(139, 92, 246, 0.2);">
                  <div class="metric-label" style="color: #8b5cf6;">Monthly Savings</div>
                  <h4 class="metric-value value-accent">$${parseFloat(totalEstimatedSavings).toLocaleString()}/mo</h4>
                </div>
              </div>
              
              <div style="background: #e0e7ff; color: #3730a3; padding: 15px; border-radius: 8px; font-weight: bold; font-size: 15px; text-align: center; margin-bottom: 30px;">
                🎉 Estimated Annual Portfolio Savings: $${annualSavings.toLocaleString()} / year!
              </div>
              
              <h3 class="portfolio-title">Audited Stack Summary</h3>
              <div class="table-container">
                <table class="portfolio-table">
                  <thead>
                    <tr>
                      <th class="th-header">Tool</th>
                      <th class="th-header">Plan</th>
                      <th class="th-header" style="text-align: center;">Seats</th>
                      <th class="th-header">Expected Cost</th>
                      <th class="th-header" style="text-align: right;">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${toolsRowsHtml}
                  </tbody>
                </table>
              </div>
              
              <div class="cta-block">
                <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/result" class="btn" target="_blank">
                  🚀 View Full Live Dashboard
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0 0 10px;">This audit is financially defensible and calculated strictly based on pricing guidelines.</p>
              <p style="margin: 0;">&copy; 2026 Credex LedgerAI Cost Audit Engine. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully dispatched: Message ID ${info.messageId}`);

    if (!useCustomSmtp) {
      etherealUrl = nodemailer.getTestMessageUrl(info);
      console.log(`TEST TRANSMISSION: Click to preview HTML email: ${etherealUrl}`);
    }

    return res.status(200).json({
      success: true,
      message: "Lead registered and optimization report email dispatched.",
      emailPreviewUrl: etherealUrl,
      leadId: savedLead ? savedLead._id : "simulation"
    });
  } catch (err) {
    console.error("Critical error in POST /api/leads route handler:", err);
    return res.status(500).json({ error: "Server error occurred while capturing lead or sending email." });
  }
};
