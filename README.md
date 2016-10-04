## Notification Plugin for Grafana

The Notification can notify by the browser notifications

#### Usage:
- go to directory you that you checkout your code
- Run vagrant machine first

   ```vagrant up```

- Provision vagrant machine ( just in case provisioning didn't finish properly)

   ```vagrant provision```

- With your browser go to http://localhost:3000


#### Development notes:

- in case you need to change range of python data feeder script
  file is in ```provisioning/scripts/feeder.py```

  once you did your changes you need to restart the feeder:

  - first ssh into vagrant box

    ```vagrant ssh```

  - restart feeder service

    ```sudo systemctl restart feeder```

