<?php

$url = $_REQUEST["url"];
if ($url) {
  // Allowed addresses
  $addresses = array(
    "https://online.ntnu.no/feeds/news/",
    "https://online.ntnu.no/api/",
    "https://online.ntnu.no/service_static/",
    "http://draug.online.ntnu.no/",
    "https://www.sit.no/ajaxdiner/get",
    "https://www.sit.no/rss.ap",
    "http://www.sit.no/rss.ap",
    "http://api.visuweb.no/bybussen/"
  );
  foreach ($addresses as $address) {
    if (strpos($url, $address) !== false) {
      $data = $_REQUEST["data"];
      // POST request
      if ($data) {
        // use key 'http' even if you send the request to https://...
        $options = array(
            'http' => array(
                'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                'method'  => 'POST',
                'content' => $data,
            ),
        );
        $context = stream_context_create($options);
        echo file_get_contents($url, false, $context);
        break;
      }
      // GET request
      else {
        echo file_get_contents($url);
        break;
      }
    }
  }
}
else {
  header('Location: mobile.html');
}

?>