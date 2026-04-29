import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { PaginatedResult } from '../../common/utils/pagination';
import { UserRole } from '../users/enums/user-role.enum';
import {
  CreateRequirementDto,
  ListRequirementsQueryDto,
  RequirementDto,
} from './dto/requirement.dto';
import { RequirementsService } from './requirements.service';

class RespondDto {
  @IsString()
  @IsNotEmpty()
  message!: string;
}

@ApiTags('Requirements')
@Controller('requirements')
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List open requirements (the buy-leads feed)' })
  list(
    @Query() query: ListRequirementsQueryDto,
  ): Promise<PaginatedResult<RequirementDto>> {
    return this.requirementsService.list(query);
  }

  @Roles(UserRole.BUYER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Get('mine')
  @ApiOperation({ summary: 'Buyer\u2019s own posted requirements' })
  mine(@CurrentUser() user: AuthenticatedUser): Promise<RequirementDto[]> {
    return this.requirementsService.listMine(user.id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get one requirement (public)' })
  byId(@Param('id', new ParseUUIDPipe()) id: string): Promise<RequirementDto> {
    return this.requirementsService.findById(id);
  }

  @Roles(UserRole.BUYER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Post a new buy requirement' })
  @ApiOkResponse({ type: RequirementDto })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRequirementDto,
  ): Promise<RequirementDto> {
    return this.requirementsService.create(user, dto);
  }

  @Roles(UserRole.BUYER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch(':id/close')
  @ApiOperation({ summary: 'Close one of your own requirements' })
  close(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RequirementDto> {
    return this.requirementsService.close(id, user);
  }

  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Post(':id/respond')
  @ApiOperation({
    summary:
      'Respond as a seller. Creates an inquiry between the buyer and you with the buyer\u2019s requirement context.',
  })
  respond(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RespondDto,
  ): Promise<{ inquiryId: string }> {
    return this.requirementsService.respond(id, user, dto.message);
  }
}
