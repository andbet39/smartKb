import { DefaultKnowledgeBase } from '../knowledge-base/knowledge-base.js';
import type { ComposeKnowledgeBaseConfig, ManagedKnowledgeBase } from './types.js';

export function composeKnowledgeBase(config: ComposeKnowledgeBaseConfig): ManagedKnowledgeBase {
  const { documentStore, indexEngine, closeStore } = config;
  const kb = new DefaultKnowledgeBase(config, config.scheduler);
  let closing: Promise<void> | undefined;
  return {
    kb,
    documentStore,
    indexEngine,
    indexStatus: id => config.scheduler.status(id),
    reconcile: () => config.reconcile(),
    close() {
      closing ??= config.closeBackend().finally(() => closeStore?.());
      return closing;
    },
  };
}
