import { Inject, Controller, Provide } from '@midwayjs/decorator';
import { Context } from 'egg';

@Provide()
@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;
}
