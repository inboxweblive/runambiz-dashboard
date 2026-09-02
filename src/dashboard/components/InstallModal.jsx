import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  X,
  Check,
  WifiOff,
  Zap,
  AppWindow
} from "lucide-react";


export default function InstallModal({
  open,
  canInstall,
  installed,
  isIOS,
  onClose,
  onInstall
}) {


  if (!open) {
    return null;
  }


  return (

    <div className="install-modal-layer">


      {/* BACKDROP */}

      <button
        type="button"
        className="install-modal-backdrop"
        aria-label="Close install instructions"
        onClick={onClose}
      />



      {/* MODAL */}

      <section
        className="install-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="installModalTitle"
      >


        {/* CLOSE */}

        <button
          type="button"
          className="install-modal-close"
          onClick={onClose}
          aria-label="Close"
        >

          <X size={20} />

        </button>



        {/* BRAND */}

        <div className="install-brand-icon">

          <img
            src="/icons/icon-192.png"
            alt=""
          />

        </div>



        <div className="install-modal-heading">


          <span className="install-eyebrow">

            RUNAMBIZ WEB APP

          </span>


          <h2 id="installModalTitle">

            Install Runambiz
            on your phone

          </h2>


          <p>

            Get faster access to your business,
            products, orders, messages and AI
            assistant directly from your home screen.

          </p>


        </div>



        {/* ALREADY INSTALLED */}

        {installed ? (

          <div className="install-complete-box">

            <Check size={20} />

            <div>

              <strong>
                Runambiz is already installed
              </strong>

              <span>
                Open it from your device home screen.
              </span>

            </div>

          </div>

        ) : (

          <>


            {/* NATIVE INSTALL */}

            {canInstall && (

              <button
  type="button"
  className="install-primary-button"
  onClick={onInstall}
>
  Install Runambiz
</button>

            )}



            {/* ANDROID */}

            <div className="install-platform">


              <div className="install-platform-heading">


                <div className="install-platform-icon">

                  <Smartphone size={19} />

                </div>


                <div>

                  <strong>
                    Android
                  </strong>

                  <span>
                    Chrome · Edge · Samsung Internet
                  </span>

                </div>


              </div>



              {canInstall ? (

                <div className="install-steps">

                  <div>
                    <span>1</span>
                    <p>
                      Tap <strong>Install Runambiz</strong> above.
                    </p>
                  </div>

                  <div>
                    <span>2</span>
                    <p>
                      Confirm the browser installation prompt.
                    </p>
                  </div>

                  <div>
                    <span>3</span>
                    <p>
                      Open Runambiz from your home screen.
                    </p>
                  </div>

                </div>

              ) : (

                <div className="install-steps">

                  <div>
                    <span>1</span>
                    <p>
                      Open your browser menu.
                    </p>
                  </div>

                  <div>
                    <span>2</span>
                    <p>
                      Choose <strong>Install app</strong> or
                      <strong> Add to Home screen</strong>.
                    </p>
                  </div>

                  <div>
                    <span>3</span>
                    <p>
                      Confirm the installation.
                    </p>
                  </div>

                </div>

              )}


            </div>



            {/* IOS */}

            <div
              className={
                isIOS
                  ? "install-platform featured"
                  : "install-platform"
              }
            >


              <div className="install-platform-heading">


                <div className="install-platform-icon">

                  <Share size={19} />

                </div>


                <div>

                  <strong>
                    iPhone / iPad
                  </strong>

                  <span>
                    Safari
                  </span>

                </div>


              </div>



              <div className="install-steps">

                <div>

                  <span>1</span>

                  <p>

                    Tap the Safari
                    <strong> Share </strong>
                    button.

                  </p>

                </div>


                <div>

                  <span>2</span>

                  <p>

                    Choose
                    <strong> Add to Home Screen</strong>.

                  </p>

                </div>


                <div>

                  <span>3</span>

                  <p>

                    Tap
                    <strong> Add</strong>.

                  </p>

                </div>


              </div>


            </div>


          </>

        )}



        {/* BENEFITS */}

        <div className="install-benefits">


          <div>

            <Zap size={16} />

            <span>
              Faster access
            </span>

          </div>


          <div>

            <AppWindow size={16} />

            <span>
              App-like experience
            </span>

          </div>


          <div>

            <WifiOff size={16} />

            <span>
              Offline-ready shell
            </span>

          </div>


        </div>


      </section>


    </div>

  );

}