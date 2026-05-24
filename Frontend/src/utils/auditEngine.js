import pricingData from "../data/pricingData";

/**
 * Derives the usage level and baseline proxy spend for a usage-based API tool based on reported spend.
 * @param {number} spend - User reported spend
 * @returns {object} - { usageLevel: "low" | "medium" | "high", baseSpend: number }
 */
export const getApiUsageProfile = (spend) => {
  const customSpend = parseFloat(spend) || 0;
  if (customSpend < 50) {
    return { usageLevel: "low", baseSpend: 50 };
  } else if (customSpend >= 50 && customSpend <= 300) {
    return { usageLevel: "medium", baseSpend: 200 };
  } else {
    return { usageLevel: "high", baseSpend: 600 };
  }
};

/**
 * Calculates the monthly cost of a plan based strictly on pricing rules.
 * @param {object} plan - Plan object from pricingData
 * @param {number} seats - Active seats
 * @param {number} customSpend - User reported spend (used to categorize API usage bands)
 * @returns {number} - Derived cost
 */
export const calculatePlanCost = (plan, seats, customSpend = null) => {
  if (!plan) return 0;
  const pricingModel = plan.pricingModel || "per-seat";
  
  if (pricingModel === "flat") {
    return plan.price;
  }
  
  if (pricingModel === "usage") {
    // Usage cost is estimated based on the proxy spend base for that usage band and the plan's multiplier
    const profile = getApiUsageProfile(customSpend || 0);
    return parseFloat((profile.baseSpend * plan.price).toFixed(2));
  }
  
  // per-seat (enforces minimum seat billing floor)
  const billedSeats = Math.max(seats, plan.minSeats || 1);
  return plan.price * billedSeats;
};

/**
 * Classifies plan confidence level.
 * @param {object} plan - Active plan object
 * @returns {string} - "high" | "medium" | "low"
 */
export const getPlanConfidence = (plan) => {
  if (!plan) return "high";
  const pricingModel = plan.pricingModel || "per-seat";
  if (pricingModel === "flat") return "high";
  if (pricingModel === "per-seat") return "medium";
  return "low"; // API / Usage plans
};

/**
 * Evaluates the alignment between plan selection and the specific tool use case.
 * @param {object} plan - Evaluated plan configuration
 * @param {string} useCase - Tool usecase focus
 * @returns {string} - "free" | "optimal" | "suboptimal" | "overpriced" | "unknown"
 */
export const getUsageTier = (plan, useCase) => {
  if (!plan) return "unknown";
  if (plan.type === "free" || plan.price === 0) return "free";

  const planName = plan.name.toLowerCase();

  // Usecase matching heuristics
  if (useCase === "coding") {
    if (planName.includes("pro") || planName.includes("individual")) return "optimal";
    return "suboptimal";
  }

  if (useCase === "design") {
    if (planName.includes("team") || planName.includes("business")) return "optimal";
    if (planName.includes("pro") || planName.includes("individual") || planName.includes("standard")) return "suboptimal";
    return "overpriced";
  }

  // Fallback: General or mixed use cases
  if (planName.includes("enterprise") || planName.includes("mega")) {
    return "overpriced";
  }
  if (planName.includes("team") || planName.includes("business")) {
    return "optimal";
  }
  return "suboptimal";
};

/**
 * Evaluates candidates and returns the highest suitable optimization candidate using a strict rule tree.
 * @param {object} toolConfig - Tool pricing dictionary
 * @param {number} seats - Target seats count
 * @param {object} currentPlan - Active selected plan
 * @param {string} useCase - Tool specific usecase
 * @returns {object} - Best plan candidate
 */
export const findBestPlan = (toolConfig, seats, currentPlan, useCase) => {
  if (!toolConfig || !toolConfig.plans || !currentPlan) return currentPlan;

  const currentPlanType = currentPlan?.type || "pro";
  const currentCost = calculatePlanCost(currentPlan, seats);

  // 1. Filter out plans that violate active seat parameters
  let candidates = toolConfig.plans.filter(p => {
    const seatLimitOk = p.maxSeats === null || p.maxSeats >= seats;
    const availabilityOk = p.isPubliclyAvailable !== false;
    const enterpriseOk = !p.isEnterpriseOnly || seats >= 50;
    return seatLimitOk && availabilityOk && enterpriseOk;
  });

  if (candidates.length === 0) return currentPlan;

  // Sort candidate plans by cost (cheapest first)
  candidates.sort((a, b) => {
    const costA = calculatePlanCost(a, seats);
    const costB = calculatePlanCost(b, seats);
    return costA - costB;
  });

  let bestPlan = currentPlan;
  let optimizedCost = currentCost;

  for (const plan of candidates) {
    const planCost = calculatePlanCost(plan, seats);
    const savingsRatio = (currentCost - planCost) / (currentCost || 1);

    // --- RULE TREE: CRITICAL FEATURE LOSS ENFORCEMENT ---
    
    // Rule A: Prevent recommending a free tier if the user is already on a paid tier
    if (currentPlanType !== "free" && plan.type === "free") continue;

    // Rule B: Large teams (seats > 2) must stay on collaborative tiers (team / business / enterprise)
    // Downgrading a team > 2 to an individual "pro" plan introduces critical feature loss (lacks unified workspace / SSO / joint billing)
    if (seats > 2 && currentPlan.type === "team" && plan.type === "pro") continue;

    // Rule C: Downgrade is only recommended if it saves > 30% of baseline expected cost and has no critical feature loss
    if (planCost < currentCost && savingsRatio >= 0.30) {
      bestPlan = plan;
      optimizedCost = planCost;
      break; // Select the cheapest viable candidate that satisfies these criteria
    }
  }

  return bestPlan;
};

/**
 * Compiles a structured optimization object if substantial monthly savings are possible.
 * Otherwise returns a clean "optimal" status mapping.
 * @param {string} toolName - Tool key
 * @param {object} currentPlan - Current plan object
 * @param {object} bestPlan - Recommended plan object
 * @param {number} seats - Active seats count
 * @param {number} currentSpend - Total expected current spend for this tool
 * @param {string} useCase - Specific tool usecase
 * @returns {object} - Optimization recommendation payload
 */
export const generateOptimization = (toolName, currentPlan, bestPlan, seats, currentSpend, useCase) => {
  if (!bestPlan || !currentPlan) return null;

  const expectedSavings = currentSpend - calculatePlanCost(bestPlan, seats, currentSpend);
  const prettyToolName = pricingData[toolName]?.name || toolName;
  const confidence = getPlanConfidence(currentPlan);

  // Determine usage band description for API plans
  let usageBandDesc = "";
  if (currentPlan.pricingModel === "usage") {
    const profile = getApiUsageProfile(currentSpend);
    usageBandDesc = `(${profile.usageLevel} usage)`;
  }

  // Handle optimal state with zero savings (finance-honest verification)
  if (expectedSavings <= 0.01 || currentPlan.name === bestPlan.name) {
    return {
      tool: toolName,
      status: "optimal",
      currentPlan: currentPlan.name,
      recommendedPlan: currentPlan.name,
      savings: 0,
      savingsRangeText: "$0 / month (fully optimized)",
      seats: seats,
      useCase: useCase,
      confidence: "high",
      reasoning: `Your current ${currentPlan.name} plan configuration is fully optimized for your team of ${seats} users under the ${useCase} focus. Current spend is stable.`
    };
  }

  // Define finance-safe uncertainty range bands based on pricing model
  let minSavings = expectedSavings * 0.90;
  let maxSavings = expectedSavings * 1.10;
  if (confidence === "low") {
    // API/Usage volatility has wider uncertainty bands (75% to 125% scenario bounds)
    minSavings = expectedSavings * 0.75;
    maxSavings = expectedSavings * 1.25;
  }

  const savingsRangeText = `$${Math.round(minSavings)} – $${Math.round(maxSavings)} / month (estimated range)`;

  // Generate finance-defensible business logic explanations
  let reasoning = "";
  if (currentPlan.pricingModel === "usage") {
    reasoning = `Your usage for ${prettyToolName} is categorized under the ${getApiUsageProfile(currentSpend).usageLevel} billing band. Switching to the optimized ${bestPlan.name} plan maintains your operational output while reducing projected API spend, capturing an estimated savings range of ${savingsRangeText}.`;
  } else if (currentPlan.minSeats && seats < currentPlan.minSeats) {
    reasoning = `You are currently paying for a ${currentPlan.minSeats}-seat minimum billing floor on the ${prettyToolName} ${currentPlan.name} plan for only ${seats} users. Downgrading to ${bestPlan.name} removes this ghost seat overhead, capturing a projected savings range of ${savingsRangeText}.`;
  } else if (bestPlan.minSeats && seats < bestPlan.minSeats) {
    reasoning = `Downgrading ${prettyToolName} to the ${bestPlan.name} tier introduces a ${bestPlan.minSeats}-seat billing minimum. Under scenario modeling, this remains the most cost-efficient layout available, capturing a savings range of ${savingsRangeText}.`;
  } else {
    reasoning = `Optimizing your ${prettyToolName} stack from ${currentPlan.name} to the ${bestPlan.name} plan reduces monthly licensing expenditure, capturing a projected savings range of ${savingsRangeText}.`;
  }

  return {
    tool: toolName,
    status: "optimized",
    currentPlan: currentPlan.name,
    recommendedPlan: bestPlan.name,
    savings: parseFloat(expectedSavings.toFixed(2)),
    savingsRangeText: savingsRangeText,
    seats: seats,
    useCase: useCase,
    confidence: confidence,
    reasoning: reasoning
  };
};

/**
 * Generates AI spend optimization report based on configured stack inputs.
 * @param {object} params
 * @param {Array<object>} params.tools - List of tools
 * @param {number} params.teamSize - Total team size
 * @param {string} params.globalUseCase - Primary team use case
 * @returns {object} - Rich audit report output
 */
export const calculateAudit = ({
  tools = [],
  teamSize = 5,
  globalUseCase = "mixed"
}) => {
  // If no tools provided, return an empty/neutral report
  if (!Array.isArray(tools) || tools.length === 0) {
    return {
      totalMonthlySpend: 0,
      totalEstimatedSavings: 0,
      totalCurrentSeats: 0,
      totalEstimatedSeats: 0,
      tools: [],
      optimizations: [],
      overallRecommendation: "No tool data provided to analyze.",
      isCredexQualified: false,
      confidence: "high",
      totalMonthlySpendRange: { min: 0, max: 0 },
      totalEstimatedSavingsRange: { min: 0, max: 0 }
    };
  }

  return runAuditEngine(tools, teamSize, globalUseCase);
};

/**
 * Internal engine orchestrator mapping inputs to helpers
 */
const runAuditEngine = (tools, teamSize, globalUseCase) => {
  let totalMonthlySpend = 0;
  let totalMonthlySpendMin = 0;
  let totalMonthlySpendMax = 0;
  let totalCurrentSeats = 0;
  const calculatedTools = [];
  const optimizations = [];

  for (const toolEntry of tools) {
    const toolName = toolEntry.tool;
    const planName = toolEntry.plan;
    const seats = parseInt(toolEntry.seats, 10) || 1;
    const userSpend = parseFloat(toolEntry.spend) || 0;
    const useCase = toolEntry.useCase || "mixed";

    // 1. Tool Configuration Lookup
    const toolConfig = pricingData[toolName];
    let currentPlan = null;
    let bestPlan = null;
    let usageTier = "unknown";

    if (toolConfig && toolConfig.plans) {
      currentPlan = toolConfig.plans.find(p => p.name === planName) || null;
    }

    // 2. Deriving True Expected Spend Range
    const expectedSpend = currentPlan 
      ? calculatePlanCost(currentPlan, seats, userSpend) 
      : userSpend;

    const confidence = getPlanConfidence(currentPlan);
    let variance = 0.10;
    if (confidence === "high") variance = 0.05;
    else if (confidence === "low") variance = 0.25;

    totalMonthlySpend += expectedSpend;
    totalMonthlySpendMin += expectedSpend * (1 - variance);
    totalMonthlySpendMax += expectedSpend * (1 + variance);
    totalCurrentSeats += seats;

    let toolReasoning = `Your current ${planName} plan configuration is optimal for your ${seats} users under the ${useCase} focus.`;
    let optStatus = "optimal";
    let savingsRangeText = "$0 / month (fully optimized)";
    let potentialSavings = 0;

    if (toolConfig && currentPlan) {
      bestPlan = findBestPlan(toolConfig, seats, currentPlan, useCase);
      usageTier = getUsageTier(currentPlan, useCase);

      // Generating structured optimization (or optimal state handling)
      const opt = generateOptimization(toolName, currentPlan, bestPlan, seats, expectedSpend, useCase);
      if (opt) {
        optStatus = opt.status;
        toolReasoning = opt.reasoning;
        savingsRangeText = opt.savingsRangeText;
        potentialSavings = opt.savings;
        
        if (opt.status === "optimized" && opt.savings > 0) {
          optimizations.push(opt);
        }
      }
    }

    const hasInputDiscrepancy = Math.abs(userSpend - expectedSpend) > 0.05;
    
    calculatedTools.push({
      tool: toolName,
      plan: planName,
      seats: seats,
      spend: expectedSpend, 
      reportedSpend: userSpend,
      useCase: useCase,
      bestPlan: bestPlan ? bestPlan.name : (currentPlan ? currentPlan.name : null),
      potentialSavings: parseFloat(potentialSavings.toFixed(2)),
      savingsRangeText: savingsRangeText,
      usageTier: usageTier,
      recommendedSeats: seats,
      estimatedCurrentSpend: expectedSpend,
      reasoning: toolReasoning,
      status: optStatus,
      discrepancyDetected: hasInputDiscrepancy,
      confidence: confidence
    });
  }

  // Calculate total savings ranges
  const totalEstimatedSavings = optimizations.reduce(
    (sum, opt) => sum + opt.savings,
    0
  );
  
  // Blended Portfolio Confidence classification (Simple Rule)
  let confidence = "high";
  const hasLowConfidence = calculatedTools.some(item => item.confidence === "low");
  const hasMediumConfidence = calculatedTools.some(item => item.confidence === "medium");
  
  if (hasLowConfidence) {
    confidence = "low"; // API presence automatically introduces wider uncertainty bounds
  } else if (hasMediumConfidence) {
    confidence = "medium";
  }

  // Overall recommendation based on savings percentage
  let overallRecommendation = "No savings detected — you’re using tools efficiently.";
  const savingsPercentage = totalMonthlySpend
    ? (totalEstimatedSavings / totalMonthlySpend) * 100
    : 0;

  if (savingsPercentage > 50) {
    overallRecommendation =
      "Significant savings detected — consider optimizing your tool stack.";
  } else if (savingsPercentage > 20) {
    overallRecommendation =
      "Good savings detected — review your subscriptions for optimization.";
  } else if (totalMonthlySpend > 0) {
    overallRecommendation =
      "Minimal savings detected — optimize where possible to reduce costs.";
  }

  const isCredexQualified = totalEstimatedSavings >= 500;

  return {
    totalMonthlySpend: parseFloat(totalMonthlySpend.toFixed(2)),
    totalEstimatedSavings: parseFloat(totalEstimatedSavings.toFixed(2)),
    totalCurrentSeats: totalCurrentSeats,
    totalEstimatedSeats: totalCurrentSeats,
    tools: calculatedTools,
    optimizations: optimizations,
    overallRecommendation: overallRecommendation,
    isCredexQualified: isCredexQualified,
    confidence: confidence,
    totalMonthlySpendRange: {
      min: parseFloat(totalMonthlySpendMin.toFixed(2)),
      max: parseFloat(totalMonthlySpendMax.toFixed(2))
    }
  };
};