#!/usr/bin/env python3
import json
import logging
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import List

INDEXNOW_KEY = os.environ.get("INDEXNOW_KEY", "").strip()
HOST = "botoview.5goos.com"
INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("IndexNow")

TOP_INDEXABLE_SERVICES = [
    "ec2", "sagemaker", "rds", "connect", "glue", "ecs", "s3", "ssm",
    "lambda", "medialive", "quicksight", "mediaconvert", "iot", "eks",
    "config", "codebuild", "workspaces", "guardduty", "securityhub",
    "cloudformation", "redshift", "autoscaling", "dynamodb", "cognito-idp",
    "logs", "elbv2", "batch", "cloudfront", "transfer", "iam", "bedrock",
    "bedrock-runtime", "organizations", "elasticache", "ce", "wafv2",
    "route53", "dms", "appstream", "cloudwatch", "transcribe", "lightsail",
    "datazone", "gamelift", "s3control", "fsx", "opensearch", "apigateway",
    "rekognition", "secretsmanager", "sts", "sqs", "sns", "stepfunctions"
]


def submit_urls(urls: List[str]) -> bool:
    if not INDEXNOW_KEY:
        logger.error("Environment variable INDEXNOW_KEY is not set.")
        return False

    if not urls:
        logger.warning("No URLs provided for IndexNow submission.")
        return False

    payload = {
        "host": HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": f"https://{HOST}/{INDEXNOW_KEY}.txt",
        "urlList": urls[:10000],
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            INDEXNOW_ENDPOINT,
            data=data,
            headers={
                "Content-Type": "application/json; charset=utf-8",
                "User-Agent": "BotoView-IndexNow/1.0"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            if status in (200, 202):
                logger.info(f"Successfully submitted {len(payload['urlList'])} high-priority URLs to IndexNow (Status: {status}).")
                return True
            else:
                logger.warning(f"IndexNow returned unexpected status: {status}")
                return False
    except urllib.error.HTTPError as e:
        error_body = ""
        try:
            error_body = e.read().decode("utf-8", errors="ignore").strip()
        except Exception:
            pass
        if error_body:
            logger.error(f"IndexNow HTTP Error: {e.code} - {e.reason} ({error_body})")
        else:
            logger.error(f"IndexNow HTTP Error: {e.code} - {e.reason}")
        return False
    except Exception as e:
        logger.error(f"Error connecting to IndexNow API: {e}")
        return False


def get_default_urls() -> List[str]:
    # Pruned high-authority indexable URLs only (Homepage + Hubs + Top AWS Services)
    urls = [
        f"https://{HOST}/",
        f"https://{HOST}/services/",
        f"https://{HOST}/releases/",
    ]

    for s in TOP_INDEXABLE_SERVICES:
        url = f"https://{HOST}/services/{s}/"
        if url not in urls:
            urls.append(url)

    return urls


def main():
    if not INDEXNOW_KEY:
        logger.error("CRITICAL: INDEXNOW_KEY environment variable is required but not set.")
        sys.exit(1)

    if len(sys.argv) > 1:
        custom_urls = sys.argv[1:]
        success = submit_urls(custom_urls)
    else:
        urls = get_default_urls()
        success = submit_urls(urls)

    if not success:
        logger.error("IndexNow submission was not successful.")
        sys.exit(1)


if __name__ == "__main__":
    main()
