import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppetiteService } from './appetite.service';

@ApiTags('Appetite & Criteria')
@Controller('appetites')
export class AppetiteController {
    constructor(private readonly appetiteService: AppetiteService) { }

    @Get('current')
    @ApiOperation({ summary: 'Get current active appetite statement for a category' })
    async findCurrent(@Query('category') category: string) {
        return this.appetiteService.findCurrentBy(category);
    }

    @Get()
    @ApiOperation({ summary: 'List all appetite statements' })
    async findAll() {
        return this.appetiteService.findAll();
    }
}
