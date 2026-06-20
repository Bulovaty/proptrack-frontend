import { useState } from "react";
import { IconBuilding, IconUsers, IconCreditCard, IconMpesa, IconCheck, IconX, IconArrowRight, IconArrowLeft } from "./Icons";
import "./Onboarding.css";

const STEPS = [
  {
    icon: IconBuilding,
    title: "Add your first property",
    desc: "Go to Properties and add the buildings you manage. Give each one a name, location, and list all your unit numbers — e.g. A01, A02, B01.",
    action: "Go to Properties",
    page: "properties",
  },
  {
    icon: IconUsers,
    title: "Add your tenants",
    desc: "Go to Tenants and link each tenant to their unit. PropTrack will track their rent, arrears, and payment history automatically.",
    action: "Go to Tenants",
    page: "tenants",
  },
  {
    icon: IconMpesa,
    title: "Connect your M-Pesa Paybill",
    desc: "Go to Settings and enter your Paybill number. PropTrack will auto-record every payment tenants make to your Paybill — nothing changes for them.",
    action: "Go to Settings",
    page: "settings",
  },
  {
    icon: IconCreditCard,
    title: "You are ready",
    desc: "Payments will now appear automatically in your Payments page. Use Search to find any tenant or transaction instantly. Send bulk SMS reminders from the Reminders page.",
    action: "Go to Dashboard",
    page: "dashboard",
  },
];

// Tutorial is shown as a small floating card (not a full blocking overlay) so
// the user can actually see and use the page underneath while following along.
export default function Onboarding({ onNavigate, onDismiss }) {
  const [step, setStep] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  // Navigating just takes the user to the page — it does NOT advance the step.
  // The user reads the instructions, goes and does the thing, then comes back
  // and clicks "Next" themselves when ready. This keeps the card's text in
  // sync with what's actually on screen instead of jumping ahead.
  const handleGoToPage = () => {
    onNavigate(current.page);
    setMinimized(true); // collapse to a small badge so it doesn't block the page
  };

  const handleNext = () => {
    if (isLast) {
      onNavigate(current.page);
      onDismiss();
      return;
    }
    setStep(s => s + 1);
    setMinimized(false);
  };

  const handleBack = () => {
    setStep(s => Math.max(0, s - 1));
    setMinimized(false);
  };

  // Minimized state — small reopen badge in the corner so the user can
  // keep working on the page without the tutorial blocking their screen.
  if (minimized) {
    return (
      <button className="onboarding-reopen" onClick={() => setMinimized(false)}>
        <current.icon size={16} />
        <span>Step {step + 1} of {STEPS.length}: {current.title}</span>
      </button>
    );
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        {/* Progress dots */}
        <div className="onboarding-progress">
          {STEPS.map((_, i) => (
            <div key={i} className={`onboarding-dot ${i === step ? "active" : i < step ? "done" : ""}`}>
              {i < step && <IconCheck size={10} />}
            </div>
          ))}
        </div>

        <button className="onboarding-skip" onClick={onDismiss} aria-label="Skip tutorial">
          <IconX size={16} />
        </button>

        <div className="onboarding-icon">
          <current.icon size={32} />
        </div>

        <div className="onboarding-step-label">Step {step + 1} of {STEPS.length}</div>
        <h2 className="onboarding-title">{current.title}</h2>
        <p className="onboarding-desc">{current.desc}</p>

        <div className="onboarding-actions">
          {!isFirst && (
            <button className="btn btn-ghost" onClick={handleBack}>
              <IconArrowLeft size={15} /> Back
            </button>
          )}

          {/* Two distinct actions: go look at the page, or move to next step */}
          <button className="btn btn-ghost" onClick={handleGoToPage}>
            {current.action}
          </button>

          <button className="btn btn-primary" onClick={handleNext}>
            {isLast ? "Finish" : "Next"} <IconArrowRight size={15} />
          </button>
        </div>

        <button className="onboarding-dismiss" onClick={onDismiss}>
          Skip tutorial
        </button>
      </div>
    </div>
  );
}
