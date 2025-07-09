import { Command } from 'commander';
import registerUniswapV2DynamicRouterCommand from './uniswap-v2-dynamic-router';

export default function registerRouterCommands(program: Command) {
  const router = program.command('router').description('Dynamic price routers');

  registerUniswapV2DynamicRouterCommand(router);
}
