"""
Customer Input Schema
Defines strictly validated Pydantic model for customer financial time-series ingestion.
"""
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, field_validator, model_validator


class CustomerInput(BaseModel):
    customer_id: str = Field(default="ANONYMOUS_CUSTOMER", description="Unique customer identifier")
    name: Optional[str] = Field(default=None, description="Customer name for personalization")
    age: Optional[int] = Field(default=None, ge=18, le=120, description="Customer age in years")
    salary_day: int = Field(default=1, ge=1, le=31, description="Day of month when salary is credited")
    emi_due_day: int = Field(default=5, ge=1, le=31, description="Day of month when loan EMI is deducted")
    credit_limit: float = Field(default=50000.0, ge=0.0, description="Aggregate approved credit card limit")

    # Time-series lists (ordered chronologically from oldest to newest)
    income: List[float] = Field(..., min_length=1, description="Monthly net income series")
    essential_expenses: List[float] = Field(..., min_length=1, description="Monthly essential living expense series")
    discretionary_expenses: Optional[List[float]] = Field(default=None, description="Monthly discretionary spending series")
    obligations: List[float] = Field(..., min_length=1, description="Monthly fixed loan/debt obligation series")
    total_debt: Optional[List[float]] = Field(default=None, description="Outstanding total debt principal series")
    savings: Optional[List[float]] = Field(default=None, description="Liquid savings balance series")
    credit_balance: Optional[List[float]] = Field(default=None, description="Revolving credit card balance series")
    payment_delays: Optional[List[int]] = Field(default=None, description="Flag (0/1) for payment delays per month")
    overdraft_count: Optional[List[int]] = Field(default=None, description="Count of overdraft events per month")
    min_payment_flag: Optional[List[int]] = Field(default=None, description="Flag (0/1) for minimum-payment-only per month")

    @field_validator("income", "essential_expenses", "obligations", mode="before")
    @classmethod
    def validate_non_empty_series(cls, v: Any) -> Any:
        if isinstance(v, list) and len(v) == 0:
            raise ValueError("Time series list cannot be empty.")
        return v

    @field_validator("income", "essential_expenses", "obligations", mode="after")
    @classmethod
    def validate_non_negative_values(cls, v: List[float]) -> List[float]:
        for val in v:
            if val < 0.0:
                raise ValueError("Financial amounts cannot be negative.")
        return v

    @model_validator(mode="after")
    def populate_defaults_and_align_series(self) -> "CustomerInput":
        n = len(self.income)
        if self.discretionary_expenses is None:
            self.discretionary_expenses = [0.0] * n
        if self.total_debt is None:
            self.total_debt = [self.obligations[-1] * 12.0] * n
        if self.savings is None:
            self.savings = [max(0.0, self.income[-1] * 0.5)] * n
        if self.credit_balance is None:
            self.credit_balance = [0.0] * n
        if self.payment_delays is None:
            self.payment_delays = [0] * n
        if self.overdraft_count is None:
            self.overdraft_count = [0] * n
        if self.min_payment_flag is None:
            self.min_payment_flag = [0] * n
        return self

    def to_dict(self) -> Dict[str, Any]:
        """Serializes model to clean dictionary matching Phase 1 feature extractor requirements."""
        return self.model_dump()
