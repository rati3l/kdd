#!/usr/bin/env bash

RAWEXPORT=$(./bin/./typex -l ts-type -r gitlab.com/patrick.erber/kdd/internal/models:/  -x "ByNamespaceName" -x "Collection" -x "ByWorkloadName" -x "ByNodeName" -x "ByContainerMetricsTimestamp" ../internal/models)

# replace time.Time by string
echo "${RAWEXPORT}" | sed 's/time.Time/string/g' | head -n -4 > ../_ui/src/clients/response_types/autogen.tsx 
