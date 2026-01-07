import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Decimal } from 'decimal.js'

@Injectable()
export class DecimalSerializerInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return this.transformDecimal(data)
      }),
    )
  }

  private transformDecimal(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj
    }

    // Handle Decimal.js instances
    if (obj instanceof Decimal) {
      return obj.toString()
    }

    // Handle Date instances - convert to ISO string
    if (obj instanceof Date) {
      return obj.toISOString()
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformDecimal(item))
    }

    // Handle objects
    if (typeof obj === 'object') {
      const transformed: any = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          transformed[key] = this.transformDecimal(obj[key])
        }
      }
      return transformed
    }

    return obj
  }
}
