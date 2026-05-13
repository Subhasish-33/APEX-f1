/**
 * APEX-F1 Runtime Monitoring
 * 
 * Captures global exceptions, unhandled promise rejections, and performance metrics.
 */

import { logger } from "./logger";

class Monitoring {
  private isInitialized = false;

  init() {
    if (typeof window === "undefined" || this.isInitialized) return;

    // Capture unhandled exceptions
    window.addEventListener("error", (event) => {
      logger.error("Unhandled Exception", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      logger.error("Unhandled Promise Rejection", {
        reason: event.reason,
      });
    });

    this.isInitialized = true;
    logger.info("Runtime monitoring initialized");
  }

  /**
   * Tracks the latency of a route transition
   */
  trackRouteTransition(from: string, to: string, duration: number) {
    logger.info(`Route Transition: ${from} -> ${to}`, { durationMs: duration });
  }

  /**
   * Tracks the latency of an API call
   */
  trackApiLatency(endpoint: string, duration: number, success: boolean) {
    if (duration > 1000) {
      logger.warn(`Slow API Response: ${endpoint}`, { durationMs: duration, success });
    } else {
      logger.debug(`API Latency: ${endpoint}`, { durationMs: duration, success });
    }
  }

  /**
   * Captures retry events for resilience analytics
   */
  trackRetry(endpoint: string, attempt: number, error: string) {
    logger.warn(`API Retry Attempt ${attempt}: ${endpoint}`, { error });
  }
}

export const monitoring = new Monitoring();
