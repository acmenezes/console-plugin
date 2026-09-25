{{/*
Expand the name of the chart.
*/}}
{{- define "partner-labs-console-plugin.name" -}}
{{- if ne .Values.plugin.name "partner-labs-console-plugin" -}}
{{- fail "plugin.name must be partner-labs-console-plugin to match the plugin manifest" -}}
{{- end -}}
{{- .Values.plugin.name -}}
{{- end }}


{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "partner-labs-console-plugin.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "partner-labs-console-plugin.labels" -}}
helm.sh/chart: {{ include "partner-labs-console-plugin.chart" . }}
{{ include "partner-labs-console-plugin.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "partner-labs-console-plugin.selectorLabels" -}}
app: {{ include "partner-labs-console-plugin.name" . }}
app.kubernetes.io/name: {{ include "partner-labs-console-plugin.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: {{ include "partner-labs-console-plugin.name" . }}
{{- end }}

{{/*
Create the name secret containing the certificate
*/}}
{{- define "partner-labs-console-plugin.certificateSecret" -}}
{{ default (printf "%s-cert" (include "partner-labs-console-plugin.name" .)) .Values.plugin.certificateSecretName }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "partner-labs-console-plugin.serviceAccountName" -}}
{{- if .Values.plugin.serviceAccount.create }}
{{- default (include "partner-labs-console-plugin.name" .) .Values.plugin.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.plugin.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the patcher
*/}}
{{- define "partner-labs-console-plugin.patcherName" -}}
{{- printf "%s-patcher" (include "partner-labs-console-plugin.name" .) }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "partner-labs-console-plugin.patcherServiceAccountName" -}}
{{- if .Values.plugin.patcherServiceAccount.create }}
{{- default (printf "%s-patcher" (include "partner-labs-console-plugin.name" .)) .Values.plugin.patcherServiceAccount.name }}
{{- else }}
{{- default "default" .Values.plugin.patcherServiceAccount.name }}
{{- end }}
{{- end }}
