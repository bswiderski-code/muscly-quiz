const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const s3Config = {
    bucket: 'trainerneedle-userfiles',
    region: 'fsn1',
    endpoint: 'https://fsn1.your-objectstorage.com',
    credentials: {
        accessKeyId: 'Z9G3EKUMBKJ2AFRP4VPD',
        secretAccessKey: 'SPAaLFf6i5aAnvWhkPlLGFFK5QdVrBKxAwotjr2k',
    },
};

const s3 = new S3Client({
    region: s3Config.region,
    endpoint: s3Config.endpoint,
    credentials: s3Config.credentials,
    forcePathStyle: true,
});

async function listPrefix(prefix) {
    console.log(`Listing with prefix: "${prefix}"...`);
    const command = new ListObjectsV2Command({
        Bucket: s3Config.bucket,
        Prefix: prefix,
        MaxKeys: 10
    });
    const response = await s3.send(command);
    if (response.Contents) {
        response.Contents.forEach(obj => console.log(` - ${obj.Key}`));
    } else {
        console.log('Empty.');
    }
}

async function test() {
    console.log('Testing S3 connectivity...');
    try {
        await listPrefix('training_plan/');
        await listPrefix('training_plan/PL/');
    } catch (err) {
        console.error('S3 Error:', err.message);
    }
}

test();
