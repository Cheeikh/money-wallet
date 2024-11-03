import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    console.log('Adding token to request:', req.url);
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('Request headers:', cloned.headers.get('Authorization'));
    return next(cloned);
  }
  
  return next(req);
}; 