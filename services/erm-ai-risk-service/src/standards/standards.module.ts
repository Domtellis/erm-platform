import { Module } from "@nestjs/common";
import { PortContextService } from "./port-context.service";
import { PrismaModule } from "../prisma/prisma.module";

/**
 * StandardsModule
 *
 * Provides the PortContextService (ILO/IMO Port Clause Registry)
 * to the rest of the AI Risk Service.
 */
@Module({
    imports: [PrismaModule],
    providers: [PortContextService],
    exports: [PortContextService],
})
export class StandardsModule { }
