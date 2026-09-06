from pydantic import BaseModel


class SkillMatchBreakdown(BaseModel):
    strong_matches: list[str] = []
    partial_matches: list[str] = []
    potential_gaps: list[str] = []


class CandidateJobMatchResponse(BaseModel):
    job_id: int
    job_title: str
    company_name: str
    location: str
    match_percentage: float
    breakdown: SkillMatchBreakdown
    explanation: str
    advisory_disclaimer: str = "This match score and explanation are AI-assisted recommendations and do not represent automated employment decisions."


class JobCandidateMatchResponse(BaseModel):
    candidate_id: int
    candidate_name: str
    candidate_email: str
    match_percentage: float
    breakdown: SkillMatchBreakdown
    explanation: str
    advisory_disclaimer: str = "This match score and explanation are AI-assisted recommendations and do not represent automated employment decisions."


class MatchExplanationDetail(BaseModel):
    job_id: int
    job_title: str
    company_name: str
    candidate_id: int
    candidate_name: str
    match_percentage: float
    breakdown: SkillMatchBreakdown
    explanation: str
    sources: list[dict] = []
    advisory_disclaimer: str = "This match score and explanation are AI-assisted recommendations and do not represent automated employment decisions."
