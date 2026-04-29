import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { SearchService } from './search.service';
import {
  SearchQueryDto,
  type SearchResponseDto,
  SuggestQueryDto,
  type SuggestResponseDto,
} from './dto/search.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Unified search across products, suppliers, and categories.',
    description:
      'When `type=all` (default) returns up to 8 of each. When `type=products|suppliers` ' +
      'returns a paginated block of just that type. When `type=categories` returns a flat list.',
  })
  search(@Query() query: SearchQueryDto): Promise<SearchResponseDto> {
    return this.searchService.search(query);
  }

  @Public()
  @Get('suggest')
  @ApiOperation({
    summary: 'Lightweight autocomplete: up to 5 hits of each type.',
  })
  suggest(@Query() query: SuggestQueryDto): Promise<SuggestResponseDto> {
    return this.searchService.suggest(query.q);
  }
}
