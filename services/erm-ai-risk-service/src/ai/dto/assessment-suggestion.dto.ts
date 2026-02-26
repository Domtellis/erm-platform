import { IsString, IsIn, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateAiStatusDto {
  @ApiProperty({
    enum: ["accepted", "modified", "rejected"],
    description: "The human decision on the suggestion",
  })
  @IsString()
  @IsIn(["accepted", "modified", "rejected"])
  status: "accepted" | "modified" | "rejected";

  @ApiProperty({
    required: false,
    description: "Optional feedback or reason if modified/rejected",
  })
  @IsString()
  @IsOptional()
  human_feedback?: string;
}
