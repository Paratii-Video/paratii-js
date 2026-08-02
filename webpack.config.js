diff --git a/src/paratii.core.vids.js b/src/paratii.core.vids.js
index aa3f4a2..e3a6b35 100644
--- a/src/paratii.core.vids.js
+++ b/src/paratii.core.vids.js
@@ -1,0 +1 @@
-/**
- * Utilities to create and manipulate information about the videos on the blockchain.
- * @param {Object} config configuration object to initialize Paratii object
- */
-export class ParatiiVids {
-  constructor (config) {
-    this.config = config
-  }
-
-  /**
-   * Register the data of this video.
-   * NB: this will _not_ upload the video file itself - just save these ata
-   * @param  {videoSch
+/**
+ * Utilities to create and manipulate information about the videos on the blockchain.
+ * @param {Object} config configuration object to initialize Paratii object
+ */
+export class ParatiiVids {
+  constructor (config) {
+    this.config = config
+  }

+  /**
+   * Get thumbnail URL for the video with the given id
+   * @param  {string} videoId id of the video
+   * @param  {number|string} size either a single number (width) or a bounding box (w:h)
+   * @return {string} URL of the thumbnail image
+   */
+  async thumbnailUrl(videoId, size) {
+    let url = this.config.api + this.apiVideos + videoId + '/thumbnail';
+    let parameters = {
+      params: {
+        url: await this.config.paratiiDbVids.videoUrl(videoId, false),
+        size: size
+      }
+    };
+    let response = await fetch(url, parameters);
+    let responseJson = await response.json();
+    return responseJson.thumbnailUrl;
+  }
+}
