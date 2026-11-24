export const TOP_INDEXABLE_SERVICES: string[] = [
    'ec2', 'sagemaker', 'rds', 'connect', 'glue', 'ecs', 's3', 'ssm',
    'lambda', 'medialive', 'quicksight', 'mediaconvert', 'iot', 'eks',
    'config', 'codebuild', 'workspaces', 'guardduty', 'securityhub',
    'cloudformation', 'redshift', 'autoscaling', 'dynamodb', 'cognito-idp',
    'logs', 'elbv2', 'batch', 'cloudfront', 'transfer', 'iam', 'bedrock',
    'bedrock-runtime', 'organizations', 'elasticache', 'ce', 'wafv2',
    'route53', 'dms', 'appstream', 'cloudwatch', 'transcribe', 'lightsail',
    'datazone', 'gamelift', 's3control', 'fsx', 'opensearch', 'apigateway',
    'rekognition', 'secretsmanager', 'sts', 'sqs', 'sns', 'stepfunctions'
];

export const RELATED_SERVICES_MAP: Record<string, string[]> = {
    's3': ['s3control', 'glacier', 'cloudfront', 'storagegateway'],
    'bedrock': ['bedrock-runtime', 'sagemaker', 'qbusiness', 'rekognition'],
    'bedrock-runtime': ['bedrock', 'sagemaker', 'rekognition', 'transcribe'],
    'sagemaker': ['bedrock', 'rekognition', 'comprehend', 'forecast'],
    'ec2': ['autoscaling', 'ecs', 'vpc-lattice', 'elbv2'],
    'lambda': ['stepfunctions', 'apigateway', 'sqs', 'sns'],
    'dynamodb': ['rds', 'elasticache', 'dax', 'timestream-query'],
    'rds': ['dynamodb', 'redshift', 'dms', 'secretsmanager'],
    'ecs': ['eks', 'ec2', 'batch', 'apprunner'],
    'eks': ['ecs', 'ec2', 'batch', 'route53'],
    'iam': ['sts', 'organizations', 'sso-admin', 'cognito-idp'],
    'cloudwatch': ['logs', 'events', 'xray', 'synthetics'],
    'logs': ['cloudwatch', 'kinesis', 'firehose', 'opensearch'],
    'sqs': ['sns', 'stepfunctions', 'lambda', 'mq'],
    'sns': ['sqs', 'pinpoint', 'ses', 'eventbridge'],
    'cloudfront': ['s3', 'route53', 'wafv2', 'shield'],
    'secretsmanager': ['kms', 'ssm', 'iam', 'sts'],
    'ssm': ['secretsmanager', 'ec2', 'config', 'guardduty'],
    'glue': ['athena', 'redshift', 'emr', 'lakeformation'],
    'stepfunctions': ['lambda', 'sqs', 'events', 'batch'],
    'route53': ['cloudfront', 'elbv2', 'apigateway', 'directconnect'],
    'apigateway': ['lambda', 'cognito-idp', 'wafv2', 'route53'],
    'elasticache': ['dynamodb', 'memorydb', 'rds', 'opensearch'],
    'redshift': ['rds', 'glue', 'athena', 'quicksight'],
    'quicksight': ['redshift', 'athena', 's3', 'rds'],
    'connect': ['lexv2-models', 'kinesis', 'chime-sdk-voice'],
    'codebuild': ['codepipeline', 'codecommit', 'ecr'],
    'guardduty': ['securityhub', 'detective', 'macie2'],
    'securityhub': ['guardduty', 'inspector2', 'accessanalyzer']
};

export function getRelatedServices(service: string, max = 4): string[] {
    const direct = RELATED_SERVICES_MAP[service.toLowerCase()] || [];
    const set = new Set(direct);
    for (const top of TOP_INDEXABLE_SERVICES) {
        if (set.size >= max) break;
        if (top !== service.toLowerCase() && !set.has(top)) {
            set.add(top);
        }
    }
    return Array.from(set).slice(0, max);
}

export interface ServiceTelemetry {
    totalUpdates: number;
    featuresCount: number;
    fixesCount: number;
    enhancementsCount: number;
    latestVersion: string;
    latestDate: string;
    firstVersion: string;
    firstDate: string;
    updates30d: number;
    updates90d: number;
    updates365d: number;
    cadenceText: string;
    clientSnippet: string;
    installSnippet: string;
    relatedServices: string[];
    isIndexable: boolean;
}

export function computeServiceTelemetry(
    service: string,
    changes: Array<{ v: string; t: string }>,
    versionDates: Record<string, string>
): ServiceTelemetry {
    const svcLower = service.toLowerCase();
    // Index all service pages that have at least 1 changelog entry.
    // Every generated service page contains unique, substantive content
    // (telemetry, changelog, quickstart, FAQ) and should be crawlable.
    const isIndexable = changes.length > 0;
    const totalUpdates = changes.length;

    let featuresCount = 0;
    let fixesCount = 0;

    for (const c of changes) {
        const textLower = (c.t || '').toLowerCase();
        if (textLower.includes('fix') || textLower.includes('bug') || textLower.includes('issue') || textLower.includes('resolve') || textLower.includes('correct')) {
            fixesCount++;
        } else if (textLower.includes('feature') || textLower.includes('api') || textLower.includes('support') || textLower.includes('add') || textLower.includes('introduce') || textLower.includes('new')) {
            featuresCount++;
        }
    }

    const enhancementsCount = Math.max(0, totalUpdates - featuresCount - fixesCount);

    const latestVersion = changes[0]?.v || '';
    const latestDate = versionDates[latestVersion] || '';
    const firstVersion = changes[changes.length - 1]?.v || '';
    const firstDate = versionDates[firstVersion] || '';

    const latestTime = latestDate ? new Date(latestDate).getTime() : Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    let updates30d = 0;
    let updates90d = 0;
    let updates365d = 0;

    for (const c of changes) {
        const dStr = versionDates[c.v];
        if (dStr) {
            const diffDays = (latestTime - new Date(dStr).getTime()) / dayMs;
            if (diffDays <= 30) updates30d++;
            if (diffDays <= 90) updates90d++;
            if (diffDays <= 365) updates365d++;
        }
    }

    let cadenceText = 'Stable API';
    if (updates30d >= 3 || updates90d >= 10) {
        cadenceText = 'High Velocity Active SDK';
    } else if (updates365d >= 12) {
        cadenceText = 'Regular Monthly Updates';
    } else if (totalUpdates >= 20) {
        cadenceText = 'Established Core Service';
    }

    const clientSnippet = `import boto3\n\n# Initialize AWS ${service.toUpperCase()} client\nclient = boto3.client('${svcLower}')\n\n# Example operation\n# response = client.describe_...()`;
    const installSnippet = `pip install boto3==${latestVersion || '1.44.9'}`;
    const relatedServices = getRelatedServices(svcLower, 4);

    return {
        totalUpdates,
        featuresCount,
        fixesCount,
        enhancementsCount,
        latestVersion,
        latestDate,
        firstVersion,
        firstDate,
        updates30d,
        updates90d,
        updates365d,
        cadenceText,
        clientSnippet,
        installSnippet,
        relatedServices,
        isIndexable
    };
}
