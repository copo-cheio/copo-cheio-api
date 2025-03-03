import {authenticate} from '@loopback/authentication';
import {MethodDecoratorFactory} from '@loopback/core';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {AuthService} from '../services';

export function session(strategyName: string, appName: string) {
  return MethodDecoratorFactory.createDecorator(
    'session',
    async (ctx, next) => {
      console.log('Running session decorator:', {strategyName, appName});

      await authenticate(strategyName)(ctx, next);

      // 🔹 Get the authenticated user from SecurityBindings
      const user: UserProfile = await ctx.get(SecurityBindings.USER);
      if (!user) {
        throw new Error('User authentication failed');
      }

      if (appName === 'admin') {
        // 🔹 Inject the AuthService and get the company ID
        const authService: AuthService = await ctx.get('services.AuthService');
        const companyId = await authService.getSignedInManagerCompany(user.id);
        user.companyId = companyId;

        console.log('User is authorized under company:', user.id, companyId);
      }

      // Proceed with request
      return next();
    },
  );
}
