import { useState, useEffect } from "react";
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

export default function Onboarding({ onNavigate, onDismiss }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

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
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>
              <IconArrowLeft size={15} /> Back
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => {
              if (isLast) { onNavigate(current.page); onDismiss(); }
              else { onNavigate(current.page); setStep(s => s + 1); }
            }}
          >
            {current.action} <IconArrowRight size={15} />
          </button>
        </div>

        <button className="onboarding-dismiss" onClick={onDismiss}>
          Skip tutorial
        </button>
      </div>
    </div>
  );
}
