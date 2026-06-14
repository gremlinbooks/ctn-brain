"""CLI entry point for python -m bridge_publisher."""
import logging
import sys

from .publisher import publish_once, run_forever


def main():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    once = "--once" in sys.argv

    if once:
        success = publish_once()
        sys.exit(0 if success else 1)
    else:
        run_forever()


if __name__ == "__main__":
    main()