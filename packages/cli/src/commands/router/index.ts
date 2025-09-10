import { Command } from 'commander';
import registerUniswapV2DynamicRouterCommand from './uniswap-v2-dynamic-router';
import registerUniswapV4DynamicRouterCommand from './uniswap-v4-dynamic-router';

export default function registerRouterCommands(program: Command) {
  const router = program.command('router').description('Dynamic price routers');

  registerUniswapV2DynamicRouterCommand(router);
  registerUniswapV4DynamicRouterCommand(router);
}
