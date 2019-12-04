# Diamond Chart

This is a diamond shaped chart used in the iSenpai SCC project. This project provides a means
to develop and generate all fragments needed to install the chart within a kibana environment.

## Development
---

There will be a few of paths to developing the chart. There are multiple paths to help
streamline the development experience.

The project has three major components:

- Kibana development and integration
- Chart and visualization development
- Rapid Kibana Plugin Development

## VSCode recommendations

Plugins:

- ms-vscode.vscode-typescript-tslint-plugin (Auto fix/sort imports and common linting problems)
- ms-azuretools.vscode-docker (View and manage docker containers)

## Skeleton Project

For the skeleton project:

IF YOU WISH TO RENAME YOUR PLUGIN

- In the plugin folder rename all applicable folders etc named 'chart' to your name of choice
- In the scripts folder: search for all occurrences of 'chart' and replace with desired name
- Update the README and any other docs.

### *Visualization*

The visualization is going to be the graphics associated with the project. This portion will
be testable and functional outside of the kibana environment. This is done because iterating changes
on the kibana plugin is very slow, so this creates a pipeline that allows for almost immediate
feedback to changes made.

This will automatically bundle in changes made to the `test/` and `src/` folders.

To start up the visualization development simply run:

```sh
npm run dev
```

This will make the visualization available on port `http://localhost:8080`.

You can modify the port by setting the environment variable:

```sh
PORT=<custom port>
```

### *Kibana*

WARNING: You MUST have Docker desktop installed on your machine for this dev environment to work
appropriately.

The kibana development is going to have it's own path to creation. This will create the .zip
plugin file necessary to install into a kibana environment.
This path of development simulates full installation into a production kibana environment.

This path will automatically bundle changes to the `kibana-plugin/` and `src/` folders.

```sh
npm run kibana
```

This makes kibana available at `http://localhost:5601`.


### *Rapid Kibana Dev*

You may notice that `npm run kibana` takes a LONG TIME to see incremental changes. So we created an additional
development command to GREATLY speed up the process. This process has some odd dependencies so please be careful to
make sure all of the requirements and instrucctions are followed closely.

##### REQUIREMENTS:

- node: v10.15.2
- yarn: 1.12.3

##### INSTRUCTIONS

| NOTICE: Kibana requires the use of `yarn` for rapid development. |
| --- |

1. First, clone this repository:

  ```sh
  git clone THIS_REPO_URL diamond/
  ```

2. Next, clone the `elastic/kibana` repo INSIDE this repo:

  ```sh
  cd diamond/
  git clone https://github.com/elastic/kibana.git ./kibana
  ```

  Your folder structure should look similar to this:

  ```
  diamond/
    kibana/
  ```

3. Next we start up the initial process which gets our elastic server rolling:

  ```sh
  yarn
  yarn kibana-src
  ```

4. Next we bootstrap and start kibana, LEAVE THE ELASTIC RPOCESS RUNNING, AND THEN IN A `NEW TERMINAL` switch over to the plugin folder `kibana-extra/chart`

  ```sh
  cd kibana-extra/chart
  yarn
  yarn kbn bootstrap
  yarn start
  ```

At this point, you should be able to make changes to the project and to the plugin folder and see
changes very quickly after refreshing the page you are working on.

To start up the evironment in the future, you can simply use `yarn kibana-src` to start up the environment.


## Deploying the Kibana Plugin
---

`NOTE: The plugin is usually already generated and committed to the repository`

After developing is complete it will be needed to install the kibana changes into an environment.
To do this: you must run the kibana development environment to ensure the plugin is up to date
with the latest content. The plugin will be found at:

```sh
kibana-extra/chart.zip
```

If you wish the deployment to be of production quality with minification enabled you MUST
have an environment variable set:

```sh
MODE=production
```

and THEN start up the kibana dev environment.

Now you should have the plugin zip file. This `.zip` file can be deployed to any `6.7.x` kibana environment simply by doing the following:

`NOTE: The bin folder may be located at a different path. This is using the default docker image path for the bin folder`

```sh
/usr/share/kibana/bin/kibana-plugin remove chart
/usr/share/kibana/bin/kibana-plugin install file:<Path to plugin zip file>
```

ALWAYS run `remove` BEFORE doing the `install`.
The `install` command is an NPM style URL or FILE uri for targetting a resource. You can look at the npm docs for installing a zipped or tarred
resource to see valid URI's/URL's.

DO NOT install as ROOT and DO NOT use sudo. If you have to use those, and you aren't sure why, there is a good chance kibana will stop working
after such an operation.

After installing, to ensure the plugin is completely available: it is recommended to restart the running kibana instance.

`Make sure you have read access of the zip file or the extraction phase of installing the plugin will fail`


# Troubleshooting

There are a lot of specific items to troubleshoot. Most issues are just docker bootup issues the start up script doesn't handle. More often than not: just open up the vscode docker plugin, look at your containers and networks. If you have duplicate networks, delete one. If your kibana container is booting up with no live connections, start up the elastic container.

## Elastic Search

### bootstrap checks failed
### max virtual memory is too low

[According to Elastic](https://www.elastic.co/guide/en/elasticsearch/reference/6.7/docker.html#docker-cli-run-prod-mode), the lowest `vm.max_map_count` can be no smaller than `262144`. If you run into this error, chances are you need to update your docker instance.

**Error Example**:
```
elasticsearch_1  | ERROR: [1] bootstrap checks failed
elasticsearch_1  | [1]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
elasticsearch_1  | [2019-11-18T22:11:45,438][INFO ][o.e.n.Node               ] [4lKj0XV] stopping ...
elasticsearch_1  | [2019-11-18T22:11:45,495][INFO ][o.e.n.Node               ] [4lKj0XV] stopped
elasticsearch_1  | [2019-11-18T22:11:45,498][INFO ][o.e.n.Node               ] [4lKj0XV] closing ...
elasticsearch_1  | [2019-11-18T22:11:45,526][INFO ][o.e.n.Node               ] [4lKj0XV] closed
elasticsearch_1  | [2019-11-18T22:11:45,530][INFO ][o.e.x.m.p.NativeController] [4lKj0XV] Native controller process has stopped - no new native processes can be started
scc-diamond_elasticsearch_1 exited with code 78
```

For archival purposes, the solution has been copied from the Elastic website and preserved below:

 - Linux

The `vm.max_map_count` setting should be set permanently in /etc/sysctl.conf:

```shell
$ grep vm.max_map_count /etc/sysctl.conf
vm.max_map_count=262144
```

To apply the setting on a live system type:
```
$ sysctl -w vm.max_map_count=262144
```


 - macOS with Docker for Mac

The `vm.max_map_count` setting must be set within the xhyve virtual machine:

```
$ screen ~/Library/Containers/com.docker.docker/Data/vms/0/tty
```

Just press enter and configure the sysctl setting as you would for Linux:
```
$ sysctl -w vm.max_map_count=262144
```


 - Windows and macOS with Docker Toolbox

The `vm.max_map_count` setting must be set via docker-machine:

```
docker-machine ssh
$ sudo sysctl -w vm.max_map_count=262144
```

