classDiagram
class Risk
class RiskAssessment
class RiskCriteriaModelVersion
class ScenarioExposure
class Assumption
class EvidenceItem
class Approval
Risk "1" --> "0..*" RiskAssessment : hasAssessment
RiskAssessment "1" --> "1" Risk : assesses
RiskAssessment "1" --> "1" RiskCriteriaModelVersion : referencesCriteriaVersion
RiskCriteriaModelVersion "1" --> "0..*" RiskAssessment : usedBy
RiskAssessment "1" --> "0..*" ScenarioExposure : quantifiesVia
ScenarioExposure "1" --> "1" RiskAssessment : belongsTo
RiskAssessment "1" --> "0..*" EvidenceItem : usesEvidence
EvidenceItem "0..*" --> "0..*" RiskAssessment : supportsAssessment
RiskAssessment "1" --> "0..*" Assumption : recordsAssumption
Assumption "0..*" --> "0..*" RiskAssessment : referencedInAssessments
RiskAssessment "1" --> "0..*" Approval : approvedVia
Approval "1" --> "1" RiskAssessment : approves