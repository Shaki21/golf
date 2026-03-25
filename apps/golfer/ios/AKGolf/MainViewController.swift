import UIKit
import WebKit

class MainViewController: UIViewController, WKNavigationDelegate {
    private var webView: WKWebView!
    private var loadingView: UIView!
    private var activityIndicator: UIActivityIndicatorView!
    private var statusLabel: UILabel!

    // Metro bundler URL - change to your Mac's IP for device testing
    private let metroURL = URL(string: "http://localhost:8081")!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupLoadingView()
        setupWebView()
        loadApp()
    }

    private func setupLoadingView() {
        loadingView = UIView(frame: view.bounds)
        loadingView.backgroundColor = UIColor(red: 0.98, green: 0.98, blue: 0.99, alpha: 1.0) // #FAFBFC
        loadingView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        let stackView = UIStackView()
        stackView.axis = .vertical
        stackView.alignment = .center
        stackView.spacing = 16
        stackView.translatesAutoresizingMaskIntoConstraints = false

        let titleLabel = UILabel()
        titleLabel.text = "AK Golf"
        titleLabel.font = UIFont.systemFont(ofSize: 28, weight: .bold)
        titleLabel.textColor = UIColor(red: 0.11, green: 0.11, blue: 0.12, alpha: 1.0) // #1C1C1E

        activityIndicator = UIActivityIndicatorView(style: .large)
        activityIndicator.color = UIColor(red: 0.0, green: 0.48, blue: 1.0, alpha: 1.0) // #007AFF
        activityIndicator.startAnimating()

        statusLabel = UILabel()
        statusLabel.text = "Kobler til..."
        statusLabel.font = UIFont.systemFont(ofSize: 16)
        statusLabel.textColor = .secondaryLabel

        stackView.addArrangedSubview(titleLabel)
        stackView.addArrangedSubview(activityIndicator)
        stackView.addArrangedSubview(statusLabel)

        loadingView.addSubview(stackView)

        NSLayoutConstraint.activate([
            stackView.centerXAnchor.constraint(equalTo: loadingView.centerXAnchor),
            stackView.centerYAnchor.constraint(equalTo: loadingView.centerYAnchor)
        ])

        view.addSubview(loadingView)
    }

    private func setupWebView() {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        // Allow localhost connections
        if #available(iOS 14.0, *) {
            config.defaultWebpagePreferences.allowsContentJavaScript = true
        }

        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.navigationDelegate = self
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.98, green: 0.98, blue: 0.99, alpha: 1.0)
        webView.alpha = 0

        view.insertSubview(webView, belowSubview: loadingView)
    }

    private func loadApp() {
        statusLabel.text = "Kobler til Metro bundler..."

        var request = URLRequest(url: metroURL)
        request.cachePolicy = .reloadIgnoringLocalCacheData
        webView.load(request)
    }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        UIView.animate(withDuration: 0.3) {
            self.webView.alpha = 1
            self.loadingView.alpha = 0
        } completion: { _ in
            self.loadingView.isHidden = true
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        showError(error)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        showError(error)
    }

    private func showError(_ error: Error) {
        activityIndicator.stopAnimating()
        statusLabel.text = "Kunne ikke koble til.\nSjekk at Metro kjorer."
        statusLabel.numberOfLines = 0
        statusLabel.textAlignment = .center

        // Add retry button
        let retryButton = UIButton(type: .system)
        retryButton.setTitle("Prov igjen", for: .normal)
        retryButton.titleLabel?.font = UIFont.systemFont(ofSize: 17, weight: .semibold)
        retryButton.addTarget(self, action: #selector(retryTapped), for: .touchUpInside)
        retryButton.translatesAutoresizingMaskIntoConstraints = false

        loadingView.addSubview(retryButton)

        NSLayoutConstraint.activate([
            retryButton.centerXAnchor.constraint(equalTo: loadingView.centerXAnchor),
            retryButton.topAnchor.constraint(equalTo: statusLabel.bottomAnchor, constant: 20)
        ])
    }

    @objc private func retryTapped() {
        // Remove retry button and reset
        loadingView.subviews.compactMap { $0 as? UIButton }.forEach { $0.removeFromSuperview() }
        activityIndicator.startAnimating()
        loadApp()
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .darkContent
    }
}
