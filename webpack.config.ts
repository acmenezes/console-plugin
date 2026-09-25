import * as path from 'path';
import { fileURLToPath } from 'url';
import type { Configuration } from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { ConsoleRemotePlugin } from '@openshift-console/dynamic-plugin-sdk-webpack';

const isProd = process.env.NODE_ENV === 'production';
const configDir = path.dirname(fileURLToPath(import.meta.url));

const config: Configuration = {
  mode: isProd ? 'production' : 'development',
  entry: {},
  context: path.resolve(configDir, 'src'),
  output: {
    path: path.resolve(configDir, 'dist'),
    filename: isProd ? '[name]-bundle-[hash].min.js' : '[name]-bundle.js',
    chunkFilename: isProd ? '[name]-chunk-[chunkhash].min.js' : '[name]-chunk.js',
  },
  resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /\/node_modules\//,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript', tsx: true },
              transform: { react: { runtime: 'automatic' } },
              target: 'es2021',
            },
          },
        },
      },
      { test: /\.ya?ml$/, use: 'yaml-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff2?|ttf|eot|otf)(\?.*$|$)/,
        type: 'asset/resource',
        generator: { filename: isProd ? 'assets/[contenthash][ext]' : 'assets/[name][ext]' },
      },
      { test: /\.(m?js)$/, resolve: { fullySpecified: false } },
    ],
  },
  devServer: {
    static: './dist',
    port: 9001,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
    },
    devMiddleware: { writeToDisk: true },
  },
  plugins: [
    new ConsoleRemotePlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(configDir, 'locales'), to: 'locales' }],
    }),
  ],
  devtool: isProd ? false : 'source-map',
};

export default config;
