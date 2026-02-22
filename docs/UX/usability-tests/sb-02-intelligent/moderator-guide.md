# Moderator Guide: SB-02 Intelligent Triage Validation

## 1. Goal
Validate that humans can effectively supervise the **Gemini 2.0 Flash** AI suggestion engine without falling victim to automation bias or losing trust due to lack of explainability.

---

## 2. Testing Scenarios

### Task A: The "AI Hallucination" Stress Test (Trust & Safety)
**Setup**: Show a breach at a residential terminal where the AI has suggested a "Low" severity, incorrectly citing a minor maintenance clause while ignoring a critical PM 2.5 air quality breach.
**Instruction**: "Review the AI's suggestion for this residential terminal breach. Do you agree with the score? If not, why?"
**Moderator Check**:
- Does the user open the **Reasoning Drawer**?
- Do they identify the ISO 45001 citation error?
- Do they successfully override the score to **High**?

### Task B: Explainable AI (XAI) Comprehension
**Setup**: Show a complex Crane Wind Speed breach with an AI-suggested "High" score.
**Instruction**: "Explain to me *why* the AI believes this is High severity. Use the evidence provided in the thinking drawer."
**Moderator Check**:
- Can the user explain the "Chain of Thought" produced by the AI?
- Are the citations (ISO 45001 §8.1.3) meaningful to them?

### Task C: The Calibration Loop
**Setup**: The user has overridden an AI suggestion.
**Instruction**: "Now that you've corrected the model, notify the AI Oversight Lead about why this mistake happened so we can tune the prompt."
**Moderator Check**:
- Navigation: Do they find the "Provide Feedback" action?
- Intuition: Is the distinction between "Case Rationale" and "Model Feedback" clear?

---

## 3. Critical Observations
- **Automation Bias**: Did the user accept a "Low" score despite obvious danger?
- **Cognitive Load**: Did expanding the reasoning drawer feel overwhelming?
- **Actionability**: Did the AI rationale help the user write their own decision faster?
