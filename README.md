# kdd
#### running locally:

go run ./cmd/kdd.go --config `<path to kdd.yaml>`



#### configuration
variables defined in yaml:
| variable       | yaml             | env                  | default value  | type   | description                                                       |
|----------------|------------------|----------------------|----------------|--------|-------------------------------------------------------------------|
| Local          | local            | KDD_LOCAL            | false          | bool   | run using kubeconfig (true), or using k8s service account (false) |
| HttpPort       | http_port        | KDD_HTTP_PORT        | 3333           | int    | port to expose the web ui on                                      |
| StaticFiles    | static_files     | KDD_STATIC_FILES     | ../_ui/build/    | string | location of react files                                           |
| KubeConfigPath | kube_config_path | KDD_KUBE_CONFIG_PATH | ~/.kube/config | string | location of kubeconfig, used when local=true    

There's one flag variable, --config, which points to the kdd.yaml file. The default value is "../"


Every variable can be configured using env vars with KDD_ prefix.


#### accessing the UI
Ui is exposed by default on localhost:3333/ui path. The port can be controlled by the http_port variable.


