/**
 * APEX-F1 Structured Logger
 * 
 * Provides environment-aware, structured logging for the frontend.
 * Ensures that production logs are minimal while development logs are rich and informative.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}

class Logger {
  private isProduction = process.env.NODE_ENV === "production";

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (this.isProduction && level === "debug") return;

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    const color = {
      info: "\x1b[32m", // Green
      warn: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
      debug: "\x1b[36m", // Cyan
    }[level];

    const reset = "\x1b[0m";

    if (!this.isProduction) {
      console[level === "debug" ? "log" : level](
        `[APEX] ${color}${level.toUpperCase()}${reset}: ${message}`,
        context || ""
      );
    } else if (level === "error" || level === "warn") {
      // In production, we could send this to an external service like Sentry or Axiom
      console[level](JSON.stringify(entry));
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log("warn", message, context);
  }

  error(message: string, context?: Record<string, any>) {
    this.log("error", message, context);
  }

  debug(message: string, context?: Record<string, any>) {
    this.log("debug", message, context);
  }

  /**
   * Specifically for capturing hydration warnings which are often silent in logs
   */
  captureHydrationWarning(component: string, details: string) {
    this.warn(`Hydration Mismatch in <${component}>`, { details });
  }
}

export const logger = new Logger();
