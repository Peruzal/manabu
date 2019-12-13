#### Test Keycloak
In order to test the authentication/authorisation, you need to run a Keycloak instance locally.
This can be achieved by running a Docker container.

1. To run a Docker container, type the following commands in the terminal:
```console
$ docker run -p 8081:8080 \
  -e KEYCLOAK_USER=admin \
  -e KEYCLOAK_PASSWORD=admin \
  -e KEYCLOAK_HTTP_PORT=8081 \
  jboss/keycloak:6.0.1
```
The Keycloak instance will be available at http://localhost:8081/auth

#### Import realm settings

Once your Keycloak container is running, login into the _Administration Console_ 
with username and password of `admin` / `admin`. Then click the _Select realm_ dropdown
and choose _Add realm_.


1. Once your Keycloak container is running, login into the _Administration Console_  with username and password of `admin` / `admin`.
2. Now setup a realm, by clicking on _Add realm_. You'll find this option by hovering over the Master heading in the top left hand corner.
3. Give your realm a name and then click _Save_.
4. Create one or more clients by clicking _Clients_ on the left panel, then click on _Create_, which is on the right. 
5. Fill in the required fields, i.e. `Client ID`, `Access Type`, and `Valid Redirect URIs`.
6. For a redirect URI, use http://localhost:3005/*.
7. Once the client is created, navigate to the _Installation_ tab on the top right.
8.  Click on the _Format Option_ dropdown list, and select `Keycloak OIDC JSON`.
9.  Download this json file, and be sure to put it in the root folder of your application.
