<!--------------- PAGE 1 ---------------->
<!--------------- SECTION 1 --------------->
# Specifica tecnica: Persona che invocano agent esterni via protocollo A2A (libreria standard)

Data: 7 giugno 2026 Stato: proposta implementativa dettagliata (nessuna modifica codice in questo documento) Ambito: backend, frontend admin Persona, tipi shared, persistenza configurazione, osservabilita e test Vincolo architetturale chiave: usare la libreria standard ufficiale A2A per tutte le chiamate outbound (no client custom protocol-level)

## 1. Obiettivo della feature

Abilitare una Persona della piattaforma a invocare altri agent remoti tramite protocollo A2A, con questo flusso:

1. In fase di configurazione admin si selezionano gli agent A2A disponibili.
2. In chat, la Persona usa quegli agent come tool.
3. Tutta la comunicazione resta nel normale flusso chat gia esistente (tool running/done, output finale al modello, risposta utente).
Obiettivo pratico: estendere il pattern gia usato per tool Persona/KB/REST/MCP, aggiungendo un nuovo tipo tool A2A, ma obbligatoriamente con SDK standard A2A.

## 2. Stato attuale del codice (analisi)

2.1 Inbound A2A gia presente Il repository espone gia Persona come server A2A (inbound): discovery card: packages/be/src/modules/a2a/a2a-discovery.controller.ts runtime REST: packages/be/src/modules/a2a/a2a-runtime-rest.controller.ts runtime JSON-RPC: packages/be/src/modules/a2a/a2a-runtime-rpc.controller.ts runtime service: packages/be/src/modules/a2a/services/a2a-runtime.service.ts configurazione per Persona: packages/be/src/entities/persona-a2a-config.entity.ts gestione admin configurazione A2A: packages/be/src/modules/admin/persona/a2a/persona-a2a-config.service.ts UI admin A2A Persona: packages/fe/src/pages/admin/persona/sections/PersonaAdminA2a.vue Questa base conferma che A2A e gia parte del dominio. La nuova feature e outbound (Persona che chiamano agent esterni), non sostitutiva dell’inbound.
2.2 Tool framework chat gia maturo Il sistema agentico interno e gia strutturato per tool dinamici: registrazione tool in handler: packages/be/src/modules/chat/handlers/agent-chatbot-handler.ts base handler tool: packages/be/src/modules/chat/tools/BaseToolHandler.ts generator esistenti: Persona-as-tool: packages/be/src/modules/chat/tools/PersonaAsAToolGenerator.ts REST API tool: packages/be/src/modules/chat/tools/ApiToolGenerator/ApiToolGenerator.ts MCP tool: packages/be/src/modules/chat/tools/McpToolGenerator.ts KB tool: packages/be/src/modules/chat/tools/kbToolGenerator.ts Questo e il punto di estensione corretto per introdurre A2A outbound.
2.3 Configurazione tool Persona in admin gia presente La selezione tool lato admin e gia operativa: opzioni handler agente: packages/fe/src/pages/admin/persona/sections/handler_options/AgentOptions.vue dialog aggiunta/modifica tool: packages/fe/src/pages/admin/persona/sections/handler_options/components/AgentToolDialog.vue form tipi tool: packages/fe/src/pages/admin/persona/sections/handler_options/components/ validazioni backend tool selezionati: packages/be/src/modules/admin/persona/dto/persona-selected-tools-validator.ts modello shared tool: packages/common/src/entities/tools.ts
## 3. Requisiti funzionali della nuova feature

3.1 Requisiti core
1. In admin, rendere disponibili agent A2A esterni selezionabili per Persona.
2. Salvare per ogni tool A2A i metadati minimi di invocazione (agent card URL, binding preferito, auth profile).
3. Durante chat, il tool A2A deve: inviare la query al remote agent via SDK standard A2A; ottenere output testuale/strutturato; restituirlo al runtime tool/langchain come ToolMessage.
4. Mostrare feedback tool coerenti con il framework attuale (running/completion/details).
5. Gestire errori A2A senza interrompere l’intero flusso chat (fallback messaggio tool error al modello).
3.2 Requisiti protocollo
1. Uso obbligatorio SDK standard A2A.
2. Supporto minimo outbound: discovery Agent Card
<!--------------- PAGE 2 ---------------->
SendMessage (REST o JSON-RPC, in base alla card)

3. Supporto opzionale ma raccomandato: polling task per completion asincrona streaming message/task updates se capability disponibile
3.3 Requisiti sicurezza
1. Nessun secret in chiaro nei payload persona/config frontend.
2. Credenziali outbound in storage sicuro backend (criptate o secret manager).
3. Allowlist host A2A configurabile (anti-SSRF).
4. Timeout, retry limitato, circuit breaker base per evitare blocchi chat.
# 4. Decisione architetturale proposta

4.1 Nuovo tipo tool: A2A Agent Tool Estendere il dominio tool con un nuovo tipo: ToolType.A2A_AGENT interfaccia A2aAgentTool Il nuovo tool viene trattato come qualsiasi altro tool in AgentChatbotHandler.
4.2 Catalogo agent A2A separato dalla Persona Per soddisfare il requisito "agent disponibili in configurazione", introdurre un catalogo centralizzato admin (simile al modello MCP server): entita catalogo agent remoti endpoint/admin actions CRUD test connessione e fetch card via SDK standard La Persona salva solo il riferimento all’agent catalogato e le opzioni tool-level (enabled, custom messages, eventuali override).
4.3 Adapter obbligatorio verso SDK standard A2A Introdurre un layer dedicato: A2aStandardClientFactory A2aOutboundInvokerService Regola: nessun punto codice chat/tool puo costruire manualmente JSON-RPC A2A o payload REST raw; tutto passa da questo adapter.
<!--------------- SECTION 2 --------------->
# 5. Impatti per layer (dettaglio file da modificare)

# 5.1 Shared types (packages/common)

File packages/common/src/entities/tools.ts

Modifiche

1. Aggiungere enum value: ToolType.A2A_AGENT = 'a2a_agent'
2. Aggiungere interfaccia: A2aAgentTool extends BaseTool campi minimi:
type: ToolType.A2A_AGENT agentId: number (riferimento catalogo) agentName: string (snapshot display) invocationMode: 'auto' | 'rest' | 'jsonrpc' timeoutMs?: number includeConversationContext?: boolean

3. Estendere union PersonaSelectedTool con A2aAgentTool.
4. Eventuale label costante: A2A_AGENT_TOOL_LABEL
Note Mantenere backward compatibility: i tool esistenti non cambiano schema.

# 5.2 Backend domain model/catalogo agent A2A (packages/be)

## Nuove entita suggerite
<!--------------- PAGE 3 ---------------->
1. A2aExternalAgentEntity id name description agentCardUrl preferredBinding (HTTP+JSON/JSONRPC/auto) authType (none/apiKey/hmac/bearer) authConfigEncrypted enabled metadataCardSnapshot createdAt/updatedAt
2. (opzionale) A2aExternalAgentHealthEntity ultimo stato health check latenza media ultimo errore
## File area target

packages/be/src/entities/ packages/be/src/database/migrations/ packages/be/src/modules/admin/ (nuovo modulo, pattern allineato a mcp-servers)

# 5.3 Backend validazione DTO tool Persona

File

packages/be/src/modules/admin/persona/dto/persona-selected-tool.dto.ts packages/be/src/modules/admin/persona/dto/persona-selected-tools-validator.ts packages/be/src/modules/admin/persona/dto/persona-config.dto.ts

Modifiche

1. Definire A2aAgentToolDto con validazioni class-validator.
2. Aggiornare validator dispatch toolsDto con ToolType.A2A_AGENT.
3. Validare coerenza con catalogo agent: agentId esistente agent enabled binding compatibile con card
<!--------------- SECTION 3 --------------->
# 5.4 Backend tool execution runtime

File

packages/be/src/modules/chat/handlers/agent-chatbot-handler.ts packages/be/src/modules/chat/chat.module.ts

Modifiche

1. In AgentChatbotHandler.getToolsRegistry: filtrare selectedTools anche per ToolType.A2A_AGENT registrare tool via nuovo generator A2aToolGenerator
2. In ChatModule providers: registrare A2aToolGenerator registrare A2aOutboundInvokerService registrare adapter SDK standard
# 5.5 Nuovo generator tool A2A

## Nuovo file suggerito

packages/be/src/modules/chat/tools/A2aToolGenerator.ts

Comportamento

1. Costruisce ChatCompletionTool function schema input minimo: query opzionale: target task options
2. Running/completion messages coerenti BaseToolHandler
3. Processo tool: costruisce context (query + eventuale history ridotta) invoca A2aOutboundInvokerService ritorna stringa JSON serializzata al modello
4. Error handling:
<!--------------- PAGE 4 ---------------->
sempre ToolMessage valido messaggio errore compatto e non sensibile

# 5.6 Adapter SDK standard A2A (core requisito)

## Nuovi file suggeriti

packages/be/src/modules/a2a-outbound/services/a2a-standard-client.factory.ts packages/be/src/modules/a2a-outbound/services/a2a-outbound-invoker.service.ts packages/be/src/modules/a2a-outbound/types/

Vincoli

1. Dipendere dalla libreria standard A2A ufficiale (SDK Node/TS ufficiale adottato dal team).
2. Vietato implementare client protocol custom nel tool generator.
3. Logging sanitizzato (mai stampare token/secret).
## Flusso invocazione

1. Fetch card (cache locale TTL).
2. Selezione binding: preferenza tool fallback su card.supportedInterfaces
3. SendMessage via SDK.
4. Gestione risposta: completed: restituzione immediata working: polling/getTask o stream subscribe (configurabile)
5. Mapping output A2A -> payload tool per LLM.
<!--------------- SECTION 4 --------------->
# 5.7 Frontend admin Persona (selezione agent in configurazione)

## File principali

packages/fe/src/pages/admin/persona/sections/handler_options/AgentOptions.vue packages/fe/src/pages/admin/persona/sections/handler_options/components/AgentToolDialog.vue packages/fe/src/pages/admin/persona/sections/handler_options/components/ (nuovo form A2A)

Modifiche

1. Aggiungere opzione tool A2A nel dialog di selezione.
2. Introdurre A2aToolForm.vue con campi: agent (select da catalogo) invocation mode timeout include conversation context
3. Caricare catalogo agent A2A da nuovo client admin FE.
4. Mostrare in ToolsTable label/icon A2A tool.
# 5.8 Frontend server actions manifest

File

packages/fe/src/services/server-actions/actions-manifest.ts

Modifiche

includere eventuali nuove admin actions per catalogo A2A agent. rigenerare manifest dopo introduzione action backend.

# 5.9 Save flow Persona + A2A config

File

packages/fe/src/pages/admin/persona/PersonaAdminDetailPage.vue

## Modifiche richieste

Nessuna variazione concettuale al flusso save attuale. Verificare che i nuovi selectedTools A2A siano persistiti insieme alla Persona. Mantenere update A2A card config separato gia esistente.

# 6. Data model proposto per A2A Agent Tool
<!--------------- PAGE 5 ---------------->
Esempio payload in selectedTools:

{ "id": "a2a-agent-ops-review-01", "name": "ops_review_agent", "label": "A2A Agent", "description": "Invoca l'agent remoto di review operativa", "enabled": true, "type": "a2a_agent", "agentId": 12, "agentName": "Ops Review Agent", "invocationMode": "auto", "timeoutMs": 45000, "includeConversationContext": true, "customMessages": { "runningMessage": "Consulto l'agent Ops Review...", "completionMessage": "Review ricevuta dall'agent Ops", "sendMessages": "both" } }
<!--------------- SECTION 5 --------------->

# 7. Flusso runtime in chat

|sequenceDiagram||||
|---|---|---|---|
|participant U|as User|||
|participant FE|as Chat|FE||
|participant BE|as||AgentChatbotHandler|
|participant TG|as||A2aToolGenerator|
|participant SDK|as A2A||Standard SDK|
|participant RA|as Remote||A2A Agent|

U->>FE: Prompt FE->>BE: /chat/stream BE->>TG: Tool call a2a_agent(query)

|BE->>TG:|Tool call|a2a_agent(query)||
|---|---|---|---|
|TG->>SDK:|sendMessage(...)|||
|SDK->>RA:|A2A SendMessage|||
|RA-->>SDK:|Task/result|||
|SDK-->>TG:|output|mapped||
|TG-->>BE:|ToolMessage(JSON)|||
|BE-->>FE:|Stream|token + tool|feedback|
|FE-->>U:|Risposta|finale||

# 8. Scelte di protocollo outbound

8.1 Priorita binding
1. Se tool.invocationMode != auto, usare binding esplicito.
2. Altrimenti: preferire JSONRPC se disponibile fallback HTTP+JSON
8.2 Payload minimo SendMessage role: user parts: text (query) metadata: source persona conversation id opzionale user identity pseudonimizzata
8.3 Gestione completion
1. Se task gia completed: ritorno immediato.
2. Se working: polling getTask ogni N secondi, max timeout
<!--------------- PAGE 6 ---------------->
opzionale subscribe stream se abilitato e stabile

8.4 Gestione polling task (specifica operativa) Per rendere il comportamento deterministico e uniforme tra agent remoti diversi, il polling deve seguire una policy standard. Parametri runtime raccomandati: pollInitialIntervalMs: 1200 pollBackoffFactor: 1.7 pollMaxIntervalMs: 5000 pollJitterRatio: 0.2 pollMaxAttempts: 30 pollMaxElapsedMs: min(tool.timeoutMs, 90000) Algoritmo:
1. Eseguire SendMessage via SDK A2A.
2. Se risposta gia terminale, terminare.
3. Se stato working, avviare ciclo polling GetTask.
4. Ad ogni iterazione: attendere l'intervallo corrente con jitter casuale (+/- 20%); chiamare GetTask(taskId); verificare stato task; se non terminale, aumentare intervallo con backoff fino a pollMaxIntervalMs.
5. Terminare il ciclo quando si verifica una condizione di stop.
Condizioni di stop:
<!--------------- SECTION 6 --------------->

task in stato completed: successo task in stato failed/canceled/rejected: errore funzionale remoto superato pollMaxAttempts superato pollMaxElapsedMs errore non retryable (es. 401, 403, 404 persistente, schema invalido)

Classificazione errori polling:

retryable: timeout di rete 429 503 500 transient non retryable: 400 401 403 404 oltre grace window iniziale payload task invalido/non parseable

Grace window per 404 iniziale:

Sono ammessi fino a 2 tentativi consecutivi con 404 subito dopo SendMessage, per gestire eventuale consistenza ritardata lato agent remoto. Dal terzo 404 consecutivo il polling termina con errore non retryable.

Supporto Retry-After:

Se il remote agent restituisce Retry-After (429/503), il prossimo intervallo deve rispettare il massimo tra intervallo calcolato e Retry-After.

Output verso runtime tool:

in successo: mappare output task in stringa/JSON sintetico da restituire al modello; in timeout: restituire errore tool esplicito "A2A task polling timeout"; in errore remoto: restituire errore tool con codice remoto normalizzato.

Impatto UX chat:

mantenere feedback tool "running" durante polling; evitare spam eventi: massimo un update di progresso ogni 2-3 iterazioni; al termine inviare singolo completion/failure message.

Metriche specifiche polling:

a2a_outbound_poll_attempts_total{agent,status} a2a_outbound_poll_elapsed_ms{agent} a2a_outbound_poll_404_grace_total{agent} a2a_outbound_poll_timeout_total{agent}

Vincoli di implementazione:

Il polling deve essere implementato nel service A2A outbound (non nel tool generator), per centralizzare policy e riuso. Le chiamate GetTask devono passare sempre dall'SDK standard A2A, come SendMessage. Il ciclo deve essere cancellabile in caso di chiusura richiesta chat (best effort cancellation).
<!--------------- SECTION 7 --------------->

# <u>9. Sicurezza e compliance</u>

1. Secret outbound mai serializzati verso FE.
2. Secret outbound mai inseriti in Persona config JSON.
3. Audit log su:
<!--------------- PAGE 7 ---------------->
chi configura tool A2A quando viene invocato agent esterno esito (ok/error/timeout)

4. Rate limiting per tool A2A per Persona.
5. Allowlist domini agent card.
6. Sanitizzazione output remoto prima di inviarlo al modello (size limit + redaction pattern).
10. Osservabilita Metriche minime a2a_outbound_calls_total{agent,binding,status} a2a_outbound_latency_ms{agent,binding} a2a_outbound_timeout_total{agent} a2a_outbound_errors_total{agent,error_type} Logging correlationId chat personaName toolId agentId binding durata esito
11. Strategia di test
11.1 Unit test backend Nuovi test consigliati:
1. A2aToolGenerator register tool success path timeout path protocol error path
2. A2aOutboundInvokerService selection binding card cache async task completion polling backoff+jitter gestione 404 grace window rispetto Retry-After stop conditions (attempts/elapsed/non-retryable)
3. DTO validator valid/invalid A2A tool payload
11.2 Integration test backend
1. Persona con selectedTools A2A -> chat stream -> tool invocation mockato.
2. Verifica tool feedback su stream.
3. Verifica fallback su errore remoto.
11.3 Frontend test
1. AgentToolDialog mostra opzione A2A.
2. A2aToolForm valida campi obbligatori.
3. Save Persona persiste selectedTools A2A.
11.4 End-to-end
1. Admin configura catalogo agent A2A.
2. Admin associa agent A2A tool a Persona.
3. User chatta con Persona e ottiene risposta che include output agent remoto.
12. Piano implementativo a step Step 1 - Dominio e tipi estensione ToolType/shared types DTO/validator backend UI minima selezione tool A2A
<!--------------- PAGE 8 ---------------->
Step 2 - Catalogo agent A2A
<!--------------- SECTION 8 --------------->

entity + migration actions/admin CRUD FE admin list/detail

Step 3 - Runtime outbound A2A con SDK standard

adapter SDK invoker service A2aToolGenerator integrazione AgentChatbotHandler

Step 4 - Hardening

allowlist timeout/retry/circuit metriche/log/audit test estesi

13. Criteri di accettazione
1. Una Persona puo avere uno o piu tool A2A configurati da admin.
2. In chat, il modello puo invocare i tool A2A e ricevere risultato.
3. Le chiamate outbound usano esclusivamente la libreria standard A2A.
4. Errori A2A non bloccano la chat: vengono incapsulati come esito tool.
5. Nessun secret esposto in FE o nei log.
6. Tutte le nuove rotte/actions sono coperte da autorizzazione coerente.
14. Rischi e mitigazioni
1. Inaffidabilita agent remoti Mitigazione: timeout breve, retry limitato, fallback deterministic.
2. Latenza elevata su tool chain Mitigazione: timeout per tool, maxIterations gia esistente, feedback running.
3. Drift schema tra card e runtime remoto Mitigazione: validazione card + test connessione in admin.
4. Crescita complessita config admin Mitigazione: wizard A2A tool minimale, default sensati.
15. Out of scope esplicito
1. Sostituire il runtime chat interno con A2A end-to-end.
2. Rimuovere gli altri tipi tool (Persona/KB/REST/MCP).
3. Federazione multi-tenant cross-instance completa.
4. UI avanzata di tracing multi-hop nella prima release.
16. Nota vincolante sulla libreria standard A2A Per questa feature, ogni chiamata outbound verso agent remoti deve passare dal client ufficiale della libreria standard A2A adottata dal progetto. Qualsiasi implementazione manuale diretta di protocollo (REST/JSON-RPC raw) e ammessa solo internamente all’SDK o in adapter strettamente delegante, non nel runtime tool.