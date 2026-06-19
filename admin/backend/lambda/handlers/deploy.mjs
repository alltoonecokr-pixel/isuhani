// 배포 핸들러 — CodeBuild "발행" 트리거 · 빌드 상태 조회

import {
  CodeBuildClient,
  StartBuildCommand,
  BatchGetBuildsCommand,
} from "@aws-sdk/client-codebuild";

const REGION = process.env.AWS_REGION || "ap-northeast-2";
const BUILD_PROJECT = process.env.BUILD_PROJECT;

const cb = new CodeBuildClient({ region: REGION });

export async function handleDeploy() {
  if (!BUILD_PROJECT) throw new Error("BUILD_PROJECT env var not set");
  const out = await cb.send(new StartBuildCommand({ projectName: BUILD_PROJECT }));
  return {
    buildId: out.build?.id,
    arn: out.build?.arn,
    status: out.build?.buildStatus,
    startTime: out.build?.startTime,
  };
}

export async function handleBuildStatus(buildId) {
  const out = await cb.send(new BatchGetBuildsCommand({ ids: [buildId] }));
  const b = out.builds?.[0];
  if (!b) return null;
  return {
    buildId: b.id,
    status: b.buildStatus,
    currentPhase: b.currentPhase,
    startTime: b.startTime,
    endTime: b.endTime,
  };
}
