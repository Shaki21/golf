#!/bin/bash

###############################################################################
# Stripe Integration Setup Script
# Automates environment setup and Stripe configuration
###############################################################################

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$SCRIPT_DIR/apps/api"
WEB_DIR="$SCRIPT_DIR/apps/web"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command_exists node; then
        log_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi

    if ! command_exists npm; then
        log_error "npm is not installed. Please install npm."
        exit 1
    fi

    if ! command_exists stripe; then
        log_warning "Stripe CLI is not installed."
        log_info "Install with: brew install stripe/stripe-cli/stripe"
        read -p "Continue without Stripe CLI? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    log_success "Prerequisites check passed"
}

# Setup backend environment
setup_backend_env() {
    log_info "Setting up backend environment..."

    if [ ! -f "$API_DIR/.env" ]; then
        if [ -f "$API_DIR/.env.example" ]; then
            cp "$API_DIR/.env.example" "$API_DIR/.env"
            log_success "Created backend .env from .env.example"
        else
            log_error "Backend .env.example not found"
            exit 1
        fi
    else
        log_warning "Backend .env already exists, skipping"
    fi
}

# Setup frontend environment
setup_frontend_env() {
    log_info "Setting up frontend environment..."

    if [ ! -f "$WEB_DIR/.env" ]; then
        if [ -f "$WEB_DIR/.env.example" ]; then
            cp "$WEB_DIR/.env.example" "$WEB_DIR/.env"
            log_success "Created frontend .env from .env.example"
        else
            log_error "Frontend .env.example not found"
            exit 1
        fi
    else
        log_warning "Frontend .env already exists, skipping"
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."

    # Backend dependencies
    log_info "Installing backend dependencies..."
    cd "$API_DIR"
    npm install
    log_success "Backend dependencies installed"

    # Frontend dependencies
    log_info "Installing frontend dependencies..."
    cd "$WEB_DIR"
    npm install
    log_success "Frontend dependencies installed"

    cd "$SCRIPT_DIR"
}

# Run database migration
run_migration() {
    log_info "Running database migration..."

    cd "$API_DIR"

    # Generate Prisma client
    log_info "Generating Prisma client..."
    npx prisma generate

    # Push schema to database
    log_info "Pushing schema to database..."
    npx prisma db push --accept-data-loss

    log_success "Database migration completed"

    cd "$SCRIPT_DIR"
}

# Setup Stripe CLI
setup_stripe_cli() {
    if command_exists stripe; then
        log_info "Setting up Stripe CLI..."

        echo ""
        log_info "Please login to Stripe CLI:"
        stripe login

        echo ""
        log_info "To get webhook secret, run in a separate terminal:"
        log_info "  stripe listen --forward-to http://localhost:3000/api/v1/webhooks/stripe"
        echo ""
        log_warning "Copy the webhook secret (whsec_...) to your backend .env file"

        read -p "Press enter when ready to continue..."
    else
        log_warning "Stripe CLI not installed, skipping Stripe setup"
    fi
}

# Display next steps
display_next_steps() {
    echo ""
    echo "======================================================================"
    log_success "Setup completed successfully!"
    echo "======================================================================"
    echo ""
    log_info "Next steps:"
    echo ""
    echo "1. Configure Stripe API keys in backend .env:"
    echo "   STRIPE_SECRET_KEY=sk_test_..."
    echo "   STRIPE_PUBLISHABLE_KEY=pk_test_..."
    echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
    echo ""
    echo "2. Configure Stripe publishable key in frontend .env:"
    echo "   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_..."
    echo ""
    echo "3. Create products and prices in Stripe Dashboard:"
    echo "   Visit: https://dashboard.stripe.com/test/products"
    echo "   Add Price IDs to backend .env"
    echo ""
    echo "4. Start the development servers:"
    echo "   Terminal 1: cd apps/api && npm run dev"
    echo "   Terminal 2: cd apps/web && npm start"
    echo "   Terminal 3: stripe listen --forward-to http://localhost:3000/api/v1/webhooks/stripe"
    echo ""
    echo "5. Test the checkout flow:"
    echo "   Visit: http://localhost:3001/pricing"
    echo "   Use test card: 4242 4242 4242 4242"
    echo ""
    log_info "For detailed instructions, see:"
    echo "   - STRIPE_INTEGRATION_COMPLETE.md"
    echo "   - INSTALLATION_INSTRUCTIONS.md"
    echo ""
}

# Main execution
main() {
    echo ""
    echo "======================================================================"
    echo "         TIER Golf - Stripe Integration Setup"
    echo "======================================================================"
    echo ""

    check_prerequisites
    setup_backend_env
    setup_frontend_env
    install_dependencies
    run_migration
    setup_stripe_cli
    display_next_steps
}

# Run main function
main
