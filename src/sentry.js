/*
 * Copyright 2017 data.world, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This product includes software developed at
 * data.world, Inc. (http://data.world/).
 */

import Raven from 'raven-js'
import path from 'path'
import { version } from '../package.json'

const configSentry = () => {
  return Raven.config(process.env.REACT_APP_SENTRY_DSN, {
    release: version,
    environment: process.env.NODE_ENV,
    ignoreErrors: [
      /Can't find variable: _tableau/
    ],
    dataCallback: (data) => {
      const exceptions = data.exception && data.exception
      const stacktrace = exceptions[0] ? exceptions[0].stacktrace : exceptions.values[0].stacktrace
      if (stacktrace && stacktrace.frames) {
        stacktrace.frames.forEach((frame) => {
          if (frame.filename.startsWith('/')) {
            frame.filename = 'app:///' + path.basename(frame.filename)
          }
        })
      }
      return data
    }
  }).install()
}

export default configSentry()
