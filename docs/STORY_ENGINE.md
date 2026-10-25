# Story engine

Events currently dispatched by UI: start, openApp (app ID), read (item ID or conversation title), password (entered lock-screen password), choose (selected node ID). Also dispatched: variable (changed key), time (HH:MM), callAnswered/callDeclined/callEnded (call target). UI state keys use ui:appId:property.

Conditions use typed string/number/boolean values. Operators: eq, neq, gt, lt, includes. Variable keys are direct names. Scoped keys: visited:wechat, read:note-clue, clue:ticket, unlocked:photo-ticket, completed:node-id. Node logic supports AND, OR and NOT-all.

Actions: variable, unlock, hide, notification, message, time, ending, choice, clue, call. Call creates a simulated incoming-call screen with answer, decline and end controls. Its target can reference an authored phone audio item. message appends a text Item under the target app. General update-App-data actions remain pending.

Choice nodes show their next nodes as options. Selected options traverse the target node; unselected branches do not run. Pending choices persist through other events and save recovery. Endings are collected in Runtime. Restart rebuilds Runtime from initial Work variables.

React Flow offers drag positioning, connections, zoom, node search, selection, properties, branch choices, condition/action editing and edge deletion. Validation checks dangling references, self loops and unreachable nodes. Loops are bounded at runtime. Delay nodes queue their actions and next edges until delayMs virtual milliseconds elapse. Pending jobs persist in saves. Clock boundaries and timer jobs execute chronologically; execution is bounded to stop zero-delay cycles. The player pauses its clock while closed.

No arbitrary JavaScript is executed. Rich content uses safe React rendering. Player choices, reads, variables, notifications and endings live in Runtime; author Work remains unchanged.
