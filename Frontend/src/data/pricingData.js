const pricingData = {
  cursor: {
    name: "Cursor",
    plans: [
      {
        name: "Hobby",
        price: 0,
        type: "free",
        maxSeats: 1,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Pro",
        price: 20,
        type: "pro",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Business",
        price: 40,
        type: "team",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      }
    ]
  },

  chatgpt: {
    name: "ChatGPT",
    plans: [
      {
        name: "Free",
        price: 0,
        type: "free",
        maxSeats: 1,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Plus",
        price: 20,
        type: "pro",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Team",
        price: 30,
        type: "team",
        maxSeats: null,
        minSeats: 2,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Enterprise",
        price: 60,
        type: "enterprise",
        maxSeats: null,
        minSeats: 150,
        pricingModel: "per-seat",
        isEnterpriseOnly: true,
        isPubliclyAvailable: true
      }
    ]
  },

  claude: {
    name: "Claude",
    plans: [
      {
        name: "Free",
        price: 0,
        type: "free",
        maxSeats: 1,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Pro",
        price: 20,
        type: "pro",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Team",
        price: 30,
        type: "team",
        maxSeats: null,
        minSeats: 5,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Enterprise",
        price: 95,
        type: "enterprise",
        maxSeats: null,
        minSeats: 100,
        pricingModel: "per-seat",
        isEnterpriseOnly: true,
        isPubliclyAvailable: true
      }
    ]
  },

  copilot: {
    name: "GitHub Copilot",
    plans: [
      {
        name: "Individual",
        price: 10,
        type: "pro",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Business",
        price: 19,
        type: "team",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Enterprise",
        price: 39,
        type: "enterprise",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: true,
        isPubliclyAvailable: true
      }
    ]
  },

  gemini: {
    name: "Gemini",
    plans: [
      {
        name: "Free",
        price: 0,
        type: "free",
        maxSeats: 1,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Advanced",
        price: 20,
        type: "pro",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Business",
        price: 30,
        type: "team",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Enterprise",
        price: 45,
        type: "enterprise",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: true,
        isPubliclyAvailable: true
      }
    ]
  },

  perplexity: {
    name: "Perplexity",
    plans: [
      {
        name: "Free",
        price: 0,
        type: "free",
        maxSeats: 1,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Pro",
        price: 20,
        type: "pro",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Enterprise",
        price: 40,
        type: "enterprise",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: true,
        isPubliclyAvailable: true
      }
    ]
  },

  v0: {
    name: "v0 by Vercel",
    plans: [
      {
        name: "Free",
        price: 0,
        type: "free",
        maxSeats: 1,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Premium",
        price: 20,
        type: "pro",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Team",
        price: 50,
        type: "team",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      }
    ]
  },

  midjourney: {
    name: "Midjourney",
    plans: [
      {
        name: "Basic",
        price: 10,
        type: "pro",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "flat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Standard",
        price: 30,
        type: "pro",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "flat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Pro",
        price: 60,
        type: "team",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "flat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Mega",
        price: 120,
        type: "enterprise",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "flat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      }
    ]
  },

  bolt: {
    name: "Bolt.new",
    plans: [
      {
        name: "Free",
        price: 0,
        type: "free",
        maxSeats: 1,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Pro",
        price: 20,
        type: "pro",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Team",
        price: 50,
        type: "team",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "per-seat",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      }
    ]
  },

  openai_api: {
    name: "OpenAI API",
    plans: [
      {
        name: "GPT-4o",
        price: 1.0, // Relative cost multiplier
        type: "pro",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "usage",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "GPT-4o-mini",
        price: 0.08, // GPT-4o-mini is 8% the price of GPT-4o
        type: "free",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "usage",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      }
    ]
  },

  anthropic_api: {
    name: "Anthropic API",
    plans: [
      {
        name: "Claude-3-5-Sonnet",
        price: 1.0, // Blended relative cost multiplier
        type: "pro",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "usage",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Claude-3-Haiku",
        price: 0.08, // Haiku is 8% the price of Claude 3.5 Sonnet
        type: "free",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "usage",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      }
    ]
  },

  gemini_api: {
    name: "Gemini API",
    plans: [
      {
        name: "Gemini-1.5-Pro",
        price: 1.0, // Relative multiplier
        type: "pro",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "usage",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      },
      {
        name: "Gemini-1.5-Flash",
        price: 0.04, // Gemini 1.5 Flash is 4% the price of Pro
        type: "free",
        maxSeats: null,
        minSeats: 1,
        pricingModel: "usage",
        isEnterpriseOnly: false,
        isPubliclyAvailable: true
      }
    ]
  }
};

export default pricingData;
