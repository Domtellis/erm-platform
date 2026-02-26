import { IsString, IsNotEmpty, IsEnum, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDecisionDto {
  @ApiProperty({ example: "BC-2026-001" })
  @IsString()
  @IsNotEmpty()
  breach_case_id: string;

  @ApiProperty({
    example: "mitigate",
    enum: ["accept", "accept_risk", "mitigate", "stop", "waive"],
  })
  @IsEnum(["accept", "accept_risk", "mitigate", "stop", "waive"])
  decision_type: string;

  @ApiProperty({ example: "Safety protocols activated." })
  @IsString()
  @IsNotEmpty()
  rationale: string;

  @ApiProperty({ example: "USER-99" })
  @IsString()
  @IsNotEmpty()
  submitted_by: string;

  @ApiProperty({ example: ["http://example.com/evidence"], required: false })
  @IsOptional()
  evidence_urls?: string[];
}
